const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DB_NAME = process.env.DB_NAME || 'morango';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
};

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let pool;

async function connectDatabase() {
  // Cria o banco automaticamente quando o MySQL estiver acessível.
  // Isso evita que o servidor morra simplesmente porque o banco ainda não foi criado.
  const bootstrap = await mysql.createConnection(DB_CONFIG);
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();
  pool = mysql.createPool({...DB_CONFIG, database: DB_NAME});
}

const hashToken = token => crypto.createHash('sha256').update(token).digest();
const makeToken = () => crypto.randomBytes(32).toString('hex');
const makeSalt = () => crypto.randomBytes(16);
const passHash = (password, salt) => crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512');
const cleanUser = u => ({ id: u.id, email: u.email, n: u.nickname });

async function initDb() {
  if (!pool) await connectDatabase();
  // The schema.sql file uses the same tables. These CREATEs also make a fresh DB usable.
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    nickname VARCHAR(16) NOT NULL,
    pass_hash VARBINARY(64) NOT NULL,
    pass_salt VARBINARY(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query(`CREATE TABLE IF NOT EXISTS user_stats (
    user_id INT UNSIGNED PRIMARY KEY,
    games INT UNSIGNED NOT NULL DEFAULT 0,
    wins INT UNSIGNED NOT NULL DEFAULT 0,
    losses INT UNSIGNED NOT NULL DEFAULT 0,
    best_day TINYINT UNSIGNED NOT NULL DEFAULT 0,
    total_kills INT UNSIGNED NOT NULL DEFAULT 0,
    play_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    INDEX idx_rank (best_day, wins, total_kills),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT UNSIGNED PRIMARY KEY,
    volume DECIMAL(3,2) NOT NULL DEFAULT 0.50,
    speed DECIMAL(2,1) NOT NULL DEFAULT 1.0,
    resolution SMALLINT UNSIGNED NOT NULL DEFAULT 800,
    fx TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS sessions (
    token_hash BINARY(32) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    INDEX idx_exp (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code CHAR(5) NOT NULL UNIQUE,
    host_user_id INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    INDEX idx_code (code),
    FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS room_players (
    room_id BIGINT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS matches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    mode ENUM('solo','coop') NOT NULL,
    result ENUM('win','loss') NOT NULL,
    days_survived TINYINT UNSIGNED NOT NULL,
    kills SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    cause VARCHAR(24) NULL,
    duration_s INT UNSIGNED NOT NULL DEFAULT 0,
    room_code CHAR(5) NULL,
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, played_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
}

async function auth(req, res, next) {
  try {
    const raw = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!raw) return res.status(401).json({ error: 'Não autenticado.' });
    const [rows] = await pool.query(
      `SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
       WHERE s.token_hash=? AND s.expires_at>NOW()`, [hashToken(raw)]
    );
    if (!rows.length) return res.status(401).json({ error: 'Sessão expirada.' });
    req.user = rows[0];
    req.token = raw;
    next();
  } catch (e) { next(e); }
}

async function settings(userId) {
  const [r] = await pool.query('SELECT volume,speed,resolution,fx FROM user_settings WHERE user_id=?', [userId]);
  const x = r[0] || { volume:.5, speed:1, resolution:800, fx:1 };
  return { vol:Number(x.volume), speed:Number(x.speed), res:Number(x.resolution), fx:Number(x.fx) };
}
async function stats(userId) {
  const [r] = await pool.query('SELECT wins,losses,best_day AS best FROM user_stats WHERE user_id=?', [userId]);
  return r[0] || { wins:0, losses:0, best:0 };
}
async function issueSession(userId) {
  const token = makeToken();
  await pool.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 30 DAY))', [hashToken(token), userId]);
  return token;
}

app.post('/api/register', async (req,res,next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const nickname = String(req.body.nickname || '').trim();
    const password = String(req.body.password || '');
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({error:'E-mail inválido.'});
    if (!nickname || nickname.length > 16) return res.status(400).json({error:'Nickname deve ter de 1 a 16 caracteres.'});
    if (password.length < 6) return res.status(400).json({error:'A senha deve ter pelo menos 6 caracteres.'});
    const salt = makeSalt();
    const [r] = await pool.query('INSERT INTO users(email,nickname,pass_hash,pass_salt) VALUES(?,?,?,?)', [email,nickname,passHash(password,salt),salt]);
    await pool.query('INSERT INTO user_stats(user_id) VALUES(?)', [r.insertId]);
    await pool.query('INSERT INTO user_settings(user_id) VALUES(?)', [r.insertId]);
    const [u] = await pool.query('SELECT * FROM users WHERE id=?', [r.insertId]);
    const token = await issueSession(r.insertId);
    res.json({token,user:cleanUser(u[0]),cfg:await settings(r.insertId)});
  } catch(e) { if(e.code==='ER_DUP_ENTRY') return res.status(409).json({error:'E-mail já cadastrado.'}); next(e); }
});

app.post('/api/login', async (req,res,next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [r] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
    if (!r.length) return res.status(401).json({error:'Credenciais inválidas.'});
    const u=r[0];
    if (!crypto.timingSafeEqual(passHash(password,u.pass_salt), Buffer.from(u.pass_hash))) return res.status(401).json({error:'Credenciais inválidas.'});
    await pool.query('UPDATE users SET last_login=NOW() WHERE id=?',[u.id]);
    const token=await issueSession(u.id);
    res.json({token,user:cleanUser(u),cfg:await settings(u.id)});
  } catch(e){next(e);}
});

app.get('/api/me', auth, async (req,res,next)=>{try{res.json({user:cleanUser(req.user),cfg:await settings(req.user.id)});}catch(e){next(e);}});
app.post('/api/logout', auth, async (req,res,next)=>{try{await pool.query('DELETE FROM sessions WHERE token_hash=?',[hashToken(req.token)]);res.json({ok:true});}catch(e){next(e);}});
app.post('/api/cfg', auth, async (req,res,next)=>{try{const v=Math.max(0,Math.min(1,Number(req.body.vol)||0)),speed=Math.max(.6,Math.min(1.6,Number(req.body.speed)||1)),resol=[640,800,960].includes(Number(req.body.res))?Number(req.body.res):800,fx=req.body.fx?1:0;await pool.query(`INSERT INTO user_settings(user_id,volume,speed,resolution,fx) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE volume=VALUES(volume),speed=VALUES(speed),resolution=VALUES(resolution),fx=VALUES(fx)`,[req.user.id,v,speed,resol,fx]);res.json({cfg:{vol:v,speed,res:resol,fx}});}catch(e){next(e);}});
app.get('/api/rank', auth, async (req,res,next)=>{try{const [r]=await pool.query(`SELECT u.nickname AS n,s.wins,s.losses,s.best_day AS best FROM user_stats s JOIN users u ON u.id=s.user_id ORDER BY s.best_day DESC,s.wins DESC,s.total_kills DESC LIMIT 10`);res.json({rank:r});}catch(e){next(e);}});
app.post('/api/match', auth, async (req,res,next)=>{try{const mode=req.body.mode==='coop'?'coop':'solo',result=req.body.win?'win':'loss',days=Math.max(0,Math.min(30,Number(req.body.days)||0)),kills=Math.max(0,Number(req.body.kills)||0),dur=Math.max(0,Number(req.body.dur)||0),room=String(req.body.room||'').slice(0,5)||null;await pool.query('INSERT INTO matches(user_id,mode,result,days_survived,kills,cause,duration_s,room_code) VALUES(?,?,?,?,?,?,?,?)',[req.user.id,mode,result,days,kills,String(req.body.cause||'').slice(0,24)||null,dur,room]);await pool.query(`INSERT INTO user_stats(user_id,games,wins,losses,best_day,total_kills,play_seconds) VALUES(?,1,?,?,?,?,?) ON DUPLICATE KEY UPDATE games=games+1,wins=wins+VALUES(wins),losses=losses+VALUES(losses),best_day=GREATEST(best_day,VALUES(best_day)),total_kills=total_kills+VALUES(total_kills),play_seconds=play_seconds+VALUES(play_seconds)`,[req.user.id,result==='win'?1:0,result==='loss'?1:0,days,kills,dur]);res.json({st:await stats(req.user.id)});}catch(e){next(e);}});

function code(){return crypto.randomBytes(4).toString('base64').replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(0,5).padEnd(5,'X');}
async function roomData(codeValue){const [r]=await pool.query(`SELECT r.id,r.code,r.host_user_id,r.started_at,u.nickname AS host FROM rooms r LEFT JOIN users u ON u.id=r.host_user_id WHERE r.code=?`,[codeValue]);if(!r.length)return null;const [p]=await pool.query(`SELECT u.id,u.nickname AS n FROM room_players rp JOIN users u ON u.id=rp.user_id WHERE rp.room_id=? ORDER BY rp.joined_at`,[r[0].id]);return {...r[0],players:p};}
app.post('/api/room/create',auth,async(req,res,next)=>{try{let c;for(let i=0;i<10;i++){c=code();const [x]=await pool.query('SELECT id FROM rooms WHERE code=?',[c]);if(!x.length)break;}const [r]=await pool.query('INSERT INTO rooms(code,host_user_id) VALUES(?,?)',[c,req.user.id]);await pool.query('INSERT INTO room_players(room_id,user_id) VALUES(?,?)',[r.insertId,req.user.id]);res.json({room:await roomData(c)});}catch(e){next(e);}});
app.post('/api/room/join',auth,async(req,res,next)=>{try{const c=String(req.body.code||'').trim().toUpperCase();const [r]=await pool.query('SELECT * FROM rooms WHERE code=? AND ended_at IS NULL',[c]);if(!r.length)return res.status(404).json({error:'Partida não encontrada.'});if(r[0].started_at)return res.status(409).json({error:'A partida já começou.'});await pool.query('INSERT IGNORE INTO room_players(room_id,user_id) VALUES(?,?)',[r[0].id,req.user.id]);res.json({room:await roomData(c)});}catch(e){next(e);}});
app.get('/api/room/:code',auth,async(req,res,next)=>{try{const room=await roomData(String(req.params.code).toUpperCase());if(!room)return res.status(404).json({error:'Partida não encontrada.'});const [m]=await pool.query('SELECT 1 FROM room_players WHERE room_id=? AND user_id=?',[room.id,req.user.id]);if(!m.length)return res.status(403).json({error:'Você não está nessa partida.'});res.json({room});}catch(e){next(e);}});
app.post('/api/room/start',auth,async(req,res,next)=>{try{const c=String(req.body.code||'').toUpperCase();const [r]=await pool.query('SELECT * FROM rooms WHERE code=? AND host_user_id=?',[c,req.user.id]);if(!r.length)return res.status(403).json({error:'Apenas o host pode iniciar.'});await pool.query('UPDATE rooms SET started_at=COALESCE(started_at,NOW()) WHERE id=?',[r[0].id]);res.json({room:await roomData(c)});}catch(e){next(e);}});
app.post('/api/room/leave',auth,async(req,res,next)=>{try{const c=String(req.body.code||'').toUpperCase();const [r]=await pool.query('SELECT * FROM rooms WHERE code=?',[c]);if(!r.length)return res.json({ok:true});await pool.query('DELETE FROM room_players WHERE room_id=? AND user_id=?',[r[0].id,req.user.id]);if(r[0].host_user_id===req.user.id){const [n]=await pool.query('SELECT user_id FROM room_players WHERE room_id=? ORDER BY joined_at LIMIT 1',[r[0].id]);await pool.query('UPDATE rooms SET host_user_id=? WHERE id=?',[n[0]?.user_id||null,r[0].id]);}res.json({ok:true});}catch(e){next(e);}});

app.use((req,res,next)=>{if(req.path.startsWith('/api/'))return next();res.sendFile(path.join(__dirname,'lost_city.html'));});
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Erro interno do servidor.'});});

initDb().then(()=>app.listen(PORT,()=>console.log(`Lost City em http://localhost:${PORT}`))).catch(err=>{console.error('Falha ao iniciar:',err);process.exit(1);});

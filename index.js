const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

app.use(session({
  secret: 'MLPKjGHghbBF2NgYHNF',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dogumtakip',
  timezone: '+03:00'
});

app.get('/', (req, res) => {
  const query = 'SELECT * FROM surgeries';
  db.query(query, (err, results) => {
    if (err) {
      console.error('MySQL sorgu hatası:', err);
      res.status(500).send('Sunucu Hatası');
      return;
    }

    const surgeries = results;
    res.render('index', { surgeries });
  });
});

app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    const query = 'SELECT * FROM surgeries';
    db.query(query, (err, results) => {
      if (err) {
        console.error('MySQL sorgu hatası:', err);
        res.status(500).send('Sunucu Hatası');
        return;
      }

      const patients = results;
      res.render('admin', { loggedIn: req.session.loggedIn, patients });
    });
  } else {
    res.render('login');
  }
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM members WHERE kullanici = ? AND sifre = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('MySQL sorgu hatası:', err);
      res.status(500).send('Sunucu Hatası');
      return;
    }

    if (results.length > 0) {
      req.session.loggedIn = true;
      res.redirect('/admin');
    } else {
      res.redirect('/admin');
    }
  });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Oturum kapatma hatası:', err);
    }
    res.redirect('/admin');
  });
});

app.post('/admin/addPatient', (req, res) => {
  const { isim, soyisim, durum, protokol_no, doktor } = req.body;
  const tarih = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query = 'INSERT INTO surgeries (isim, soyisim, durum, protokol_no, doktor, tarih) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [isim, soyisim, durum, protokol_no, doktor, tarih], (err, result) => {
    if (err) {
      console.error('MySQL sorgu hatası:', err);
      res.status(500).send('Sunucu Hatası');
    } else {
      res.redirect('/admin');
    }
  });
});

app.post('/admin/updatePatient', (req, res) => {
  const { patientId, newStatus } = req.body;

  const query = 'UPDATE surgeries SET durum = ? WHERE id = ?';
  db.query(query, [newStatus, patientId], (err, result) => {
    if (err) {
      console.error('MySQL sorgu hatası:', err);
      res.status(500).send('Sunucu Hatası');
    } else {
      res.redirect('/admin');
    }
  });
});

app.post('/admin/deletePatient', (req, res) => {
  const { patientId } = req.body;

  const query = 'DELETE FROM surgeries WHERE id = ?';
  db.query(query, [patientId], (err, result) => {
    if (err) {
      console.error('MySQL sorgu hatası:', err);
      res.status(500).send('Sunucu Hatası');
    } else {
      res.redirect('/admin');
    }
  });
});

app.get('/update-index', (req, res) => {
  const query = 'SELECT * FROM surgeries';
  db.query(query, (err, results) => {
    if (err) {
      console.error('MySQL sorgu hatası:', err);
      res.status(500).json({ success: false, error: 'Sunucu Hatası' });
    } else {
      const updatedData = results;
      res.status(200).json({ success: true, data: updatedData });
    }
  });
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor.`);
});

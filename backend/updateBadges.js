const mongoose = require('mongoose');
const Badge = require('./src/models/Badge');

const update = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/meetsport');
    await Badge.updateOne({ name: 'Primera Actividad' }, { name: 'Primera Activitat', description: 'Has completat la teva primera activitat', requirement: 'Participar en 1 activitat' });
    await Badge.updateOne({ name: '1000 Puntos' }, { name: '1000 Punts', description: 'Has assolit 1000 punts', requirement: 'Acumular 1000 punts' });
    await Badge.updateOne({ name: '5000 Puntos' }, { name: '5000 Punts', description: 'Has assolit 5000 punts', requirement: 'Acumular 5000 punts' });
    await Badge.updateOne({ name: 'Usuario Fiable' }, { name: 'Usuari Fiable', description: 'Tens una qualificació mitjana de 4.5+ estrelles', requirement: 'Mitjana de valoració >= 4.5 estrelles' });
    await Badge.updateOne({ name: 'Organizador Activo' }, { name: 'Organitzador Actiu', description: 'Has organitzat 5 activitats', requirement: 'Crear 5 activitats' });
    console.log('Database badges updated to Catalan');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
update();

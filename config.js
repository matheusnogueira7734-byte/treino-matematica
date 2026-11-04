// Configuração do Firebase do projeto "treino-de-matematica".
// A apiKey do Firebase pode ficar pública: quem protege os dados são as regras (firestore.rules).
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCNZ7SD17w2TSlyMyzgHImDNGD_6sDR0Yg",
  authDomain: "treino-de-matematica.firebaseapp.com",
  projectId: "treino-de-matematica",
  storageBucket: "treino-de-matematica.firebasestorage.app",
  messagingSenderId: "884859646183",
  appId: "1:884859646183:web:34019ecf4bf6a7c4aab242",
  measurementId: "G-DZT36X7RJL",

  // >>> EDITE: e-mails dos guias (professores), em letras minúsculas.
  adminEmails: ["matheus.nogueira4@portalsesisp.org.br", "matheus.nogueira7734@gmail.com"],

  // Deixe false. Só mude para true depois de publicar a função da IA (opcional).
  iaFunction: false
};

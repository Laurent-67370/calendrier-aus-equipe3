const admin = require('firebase-admin');

// --- DONNÉES DE DÉPART ---

// 1. Liste des joueurs de l'équipe 3
const playersData = [ 
    { id: 1, name: 'Philippe' }, 
    { id: 2, name: 'Jean-Pierre THEODIN' }, 
    { id: 3, name: 'Bernard Wolf' }, 
    { id: 4, name: 'Julien' }, 
    { id: 5, name: 'Laurent Husser' }, 
    { id: 6, name: 'Christine Pontida' }
];

// Fonctions utilitaires
const getDefaultComposition = () => ({ available: [], unavailable: [], noresponse: playersData.map(p => p.id), selected: [] });
const getDefaultScore = () => ({ alsatia: 0, opponent: 0 });

// 2. Liste des matchs de l'équipe 3
const initialMatchesData = [
    // --- MODIFICATION APPLIQUÉE ICI ---
    { 
        id: 'J1', 
        journee: 1, 
        homeTeam: 'OSTWALD ST OSWALD 5', 
        awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', 
        date: '2025-09-18', 
        time: '20h00', 
        venue: 'away', 
        month: 'september',
        composition: { // Composition par défaut pour la J1
            available: [1, 2, 4], // Philippe, JP, Julien
            unavailable: [],
            noresponse: [3, 5, 6],
            selected: [4, 2, 1] // Julien, JP, Philippe comme sur l'image
        }, 
        score: getDefaultScore() // Score initialisé à 0-0
    },
    // Les autres journées sont initialisées normalement
    { id: 'J2', journee: 2, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'STBG ST JEAN 6', date: '2025-10-02', time: '20h15', venue: 'home', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J3', journee: 3, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'STBG CTS 4', date: '2025-10-16', time: '20h15', venue: 'home', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J4', journee: 4, homeTeam: 'STBG RACING CLUB 3', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2025-10-31', time: '20h15', venue: 'away', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J5', journee: 5, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'BISCHHEIM CHEMINOTS T.T. 2', date: '2025-11-20', time: '20h15', venue: 'home', month: 'november', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J6', journee: 6, homeTeam: 'OSTWALD ST OSWALD 7', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2025-12-05', time: '20h00', venue: 'away', month: 'december', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J7', journee: 7, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'VENDENHEIM ENVOLEE 6', date: '2025-12-18', time: '20h15', venue: 'home', month: 'december', composition: getDefaultComposition(), score: getDefaultScore() }
];

// 3. Données du classement basées sur votre image
const initialRankingData = [
    { rang: 1, equipe: "ALSATIA UNITAS SCHILTIGHEIM 3", pointsResultat: 5, joues: 1, gagnes: 1, nuls: 0, perdus: 0, pointsJeuGagnes: 10, pointsJeuPerdus: 0, isOurTeam: true },
    { rang: 2, equipe: "OSTWALD ST OSWALD 7", pointsResultat: 5, joues: 1, gagnes: 1, nuls: 0, perdus: 0, pointsJeuGagnes: 10, pointsJeuPerdus: 0, isOurTeam: false },
    { rang: 3, equipe: "VENDENHEIM ENVOLEE 6", pointsResultat: 5, joues: 1, gagnes: 1, nuls: 0, perdus: 0, pointsJeuGagnes: 8, pointsJeuPerdus: 2, isOurTeam: false },
    { rang: 4, equipe: "BISCHHEIM CHEMINOTS T.T. 2", pointsResultat: 4, joues: 1, gagnes: 1, nuls: 0, perdus: 0, pointsJeuGagnes: 7, pointsJeuPerdus: 3, isOurTeam: false },
    { rang: 5, equipe: "STBG RACING CLUB 3", pointsResultat: 2, joues: 1, gagnes: 0, nuls: 0, perdus: 1, pointsJeuGagnes: 3, pointsJeuPerdus: 7, isOurTeam: false },
    { rang: 6, equipe: "STBG ST JEAN 6", pointsResultat: 1, joues: 1, gagnes: 0, nuls: 0, perdus: 1, pointsJeuGagnes: 2, pointsJeuPerdus: 8, isOurTeam: false },
    { rang: 7, equipe: "OSTWALD ST OSWALD 5", pointsResultat: 1, joues: 1, gagnes: 0, nuls: 0, perdus: 1, pointsJeuGagnes: 0, pointsJeuPerdus: 10, isOurTeam: false },
    { rang: 8, equipe: "STBG CTS 4", pointsResultat: 1, joues: 1, gagnes: 0, nuls: 0, perdus: 1, pointsJeuGagnes: 0, pointsJeuPerdus: 10, isOurTeam: false }
];


// --- Logique d'initialisation (ne pas modifier) ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

exports.handler = async function(event, context) {
  try {
    // Initialisation des matchs
    const matchesCollection = db.collection('matches-equipe3');
    const matchesSnapshot = await matchesCollection.get();
    if (matchesSnapshot.empty) {
        const matchesBatch = db.batch();
        initialMatchesData.forEach(match => {
            const { id, ...matchData } = match;
            matchesBatch.set(matchesCollection.doc(id), matchData);
        });
        await matchesBatch.commit();
    }

    // Initialisation des joueurs
    const playersCollection = db.collection('players-equipe3');
    const playersSnapshot = await playersCollection.get();
    if (playersSnapshot.empty) {
        const playersBatch = db.batch();
        playersData.forEach(player => {
            playersBatch.set(playersCollection.doc(String(player.id)), player);
        });
        await playersBatch.commit();
    }

    // Initialisation du classement
    const rankingCollection = db.collection('ranking-equipe3');
    const rankingSnapshot = await rankingCollection.get();
    if (rankingSnapshot.empty) {
        const rankingBatch = db.batch();
        initialRankingData.forEach(team => {
            rankingBatch.set(rankingCollection.doc(), team);
        });
        await rankingBatch.commit();
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Base de données pour l'équipe 3 initialisée ou déjà existante." }),
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base : ", error);
    return { statusCode: 500, body: error.toString() };
  }
};
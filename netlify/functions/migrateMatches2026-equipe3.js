const admin = require('firebase-admin');

// Fonction de migration pour ajouter les matchs 2026 (J8-J14)
const getDefaultComposition = () => ({ available: [], unavailable: [], noresponse: [1, 2, 3, 4, 5, 6], selected: [] });
const getDefaultScore = () => ({ alsatia: 0, opponent: 0 });

// Nouveaux matchs 2026 à ajouter
const newMatches2026 = [
    { id: 'J8', journee: 8, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'OSTWALD ST OSWALD 5', date: '2026-01-22', time: '20h15', venue: 'home', month: 'january', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J9', journee: 9, homeTeam: 'STBG ST JEAN 6', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-01-30', time: '20h15', venue: 'away', month: 'january', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J10', journee: 10, homeTeam: 'STBG CTS 4', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-02-11', time: '20h15', venue: 'away', month: 'february', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J11', journee: 11, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'STBG RACING CLUB 3', date: '2026-03-12', time: '20h15', venue: 'home', month: 'march', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J12', journee: 12, homeTeam: 'BISCHHEIM CHEMINOTS T.T. 2', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-04-03', time: '20h15', venue: 'away', month: 'april', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J13', journee: 13, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'OSTWALD ST OSWALD 7', date: '2026-04-23', time: '20h15', venue: 'home', month: 'april', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J14', journee: 14, homeTeam: 'VENDENHEIM ENVOLEE 6', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-05-15', time: '20h00', venue: 'away', month: 'may', composition: getDefaultComposition(), score: getDefaultScore() }
];

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
    const matchesCollection = db.collection('matches-equipe3');
    const matchesBatch = db.batch();
    let addedCount = 0;

    // Vérifier et ajouter chaque nouveau match s'il n'existe pas
    for (const match of newMatches2026) {
      const { id, ...matchData } = match;
      const docRef = matchesCollection.doc(id);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        matchesBatch.set(docRef, matchData);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await matchesBatch.commit();
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Migration réussie ! ${addedCount} nouveau(x) match(s) ajouté(s) pour 2026.`,
          addedMatches: addedCount
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Tous les matchs 2026 sont déjà présents dans la base de données.",
          addedMatches: 0
        }),
      };
    }
  } catch (error) {
    console.error("Erreur lors de la migration : ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() })
    };
  }
};

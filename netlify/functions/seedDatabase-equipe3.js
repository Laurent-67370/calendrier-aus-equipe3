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

// 2. Liste des matchs de l'équipe 3 — Saison 2026-2027, Division 2 poule A (1ère phase)
// Source : PDF secteur Strasbourg "Saison 2026-2027 - Calendrier de 1ère Phase" (25-08-2026)
const initialMatchesData = [
    { id: 'N1', journee: 1, homeTeam: 'LA WANTZENAU ST PAUL 4', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-09-09', time: '20h', venue: 'away', month: 'september', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N2', journee: 2, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'STBG ST JEAN 5', date: '2026-09-24', time: '20h15', venue: 'home', month: 'september', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N3', journee: 3, homeTeam: 'TT-SOUFFEL 3', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-10-09', time: '20h30', venue: 'away', month: 'october', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N4', journee: 4, homeTeam: 'TT-SOUFFEL 4', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-10-27', time: '20h', venue: 'away', month: 'october', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N5', journee: 5, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'OSTWALD ST OSWALD 6', date: '2026-11-12', time: '20h15', venue: 'home', month: 'november', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N6', journee: 6, homeTeam: 'OSTWALD ST OSWALD 4', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-11-23', time: '20h', venue: 'away', month: 'november', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'N7', journee: 7, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'BISCHHEIM CHEMINOTS T.T. 1', date: '2026-12-17', time: '20h15', venue: 'home', month: 'december', season: '2026-2027', composition: getDefaultComposition(), score: getDefaultScore() }
];

// 3. Classement : vide au départ de la saison 2026-2027 — sera rempli au fil des
// journées (le seed précédent datait de la saison 2025-2026 et n'a plus de valeur).
const initialRankingData = [];


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
    // Initialisation des matchs - Ajoute uniquement les matchs manquants
    const matchesCollection = db.collection('matches-equipe3');
    const matchesBatch = db.batch();
    let addedMatches = 0;

    // Migration saison : les anciens matchs (J1-J14, 2025-2026) n'ont pas de champ
    // 'season' — on le rajoute pour que l'app puisse filtrer la saison en cours.
    try {
      const allSnapshot = await matchesCollection.get();
      const tagBatch = db.batch();
      let tagged = 0;
      allSnapshot.forEach(doc => {
        if (!doc.data().season) { tagBatch.update(doc.ref, { season: '2025-2026' }); tagged++; }
      });
      if (tagged > 0) { await tagBatch.commit(); console.log(`Migration saison : ${tagged} ancien(s) match(s) tagué(s) 2025-2026.`); }
    } catch (e) { console.error('Tag anciens matchs:', e); }

    for (const match of initialMatchesData) {
        const { id, ...matchData } = match;
        const docRef = matchesCollection.doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            matchesBatch.set(docRef, matchData);
            addedMatches++;
        }
    }

    if (addedMatches > 0) {
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

    // Mise à jour du classement - Supprime l'ancien et ajoute le nouveau
    const rankingCollection = db.collection('ranking-equipe3');
    const rankingSnapshot = await rankingCollection.get();

    // Supprimer tous les documents existants
    const deleteBatch = db.batch();
    rankingSnapshot.docs.forEach(doc => {
        deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();

    // Ajouter les nouvelles données de classement
    const rankingBatch = db.batch();
    initialRankingData.forEach(team => {
        rankingBatch.set(rankingCollection.doc(), team);
    });
    await rankingBatch.commit();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Base de données pour l'équipe 3 initialisée avec succès.",
        matchesAdded: addedMatches,
        totalMatches: initialMatchesData.length
      }),
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base : ", error);
    return { statusCode: 500, body: error.toString() };
  }
};
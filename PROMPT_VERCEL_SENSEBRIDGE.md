# Prompt complet pour Vercel v0 — SENSEBRIDGE

Copie-colle le texte ci-dessous dans Vercel v0. Joins aussi, si possible, les fichiers `UI/maquette_deux_parcours_sensebridge.html` et `icon-192 d'ouverture.png` comme références visuelles.

---

## PROMPT À COLLER DANS VERCEL

Agis comme une équipe expérimentée en conception UX/UI accessible, développement frontend et intégration d’IA. Crée une application web mobile-first, responsive et installable (PWA) appelée **SENSEBRIDGE**, en français, destinée à faciliter l’accès à l’information visuelle et sonore. Le projet est un prototype universitaire de démonstration pour les personnes aveugles ou malvoyantes, sourdes ou malentendantes, et éventuellement les personnes âgées ou rencontrant temporairement des difficultés d’accès à l’information.

### 1. But et principes du projet

SENSEBRIDGE relie une application sur téléphone à des aides visuelles, auditives et à des dispositifs connectés. Le téléphone est le centre du système: il capture, traite et restitue. Construis d’abord un logiciel fonctionnel, pouvant être essayé immédiatement sans acheter de matériel. L’application doit être honnête sur ce qui fonctionne réellement, ce qui est une simulation et ce qui dépend d’un appareil ou d’un service externe.

Priorités:

1. Une expérience accessible et compréhensible.
2. Une assistance visuelle: description d’image et lecture OCR.
3. Une assistance auditive: transcription, réponse écrite/voix et détection expérimentale de sons.
4. Un gant virtuel simulant deux commandes et leur confirmation vibratoire.
5. Un drone en simulation uniquement, avec commandes accessibles et sécurités visibles.
6. Une préparation claire à une future connexion BLE du gant et à une future caméra mains libres, sans prétendre que ces appareils sont déjà connectés.

Ne construis pas un backend propriétaire si l’application peut fonctionner sans lui. Conserve les préférences et les données de démonstration localement sur l’appareil. Utilise des bibliothèques et services gratuits ou déjà disponibles quand c’est réaliste. N’invente jamais une connexion à un vrai gant, à de vraies lunettes ou à un vrai drone.

### 2. Technologie et livraison

- Utilise Next.js avec TypeScript, React et une structure simple à maintenir, compatible avec le déploiement Vercel.
- Réalise une PWA installable sur téléphone, avec manifeste, icônes, nom de l’application et fonctionnement des écrans principaux hors ligne. Mets les bibliothèques ou modèles lourds en chargement différé au premier usage, avec indication de téléchargement et état hors ligne.
- Pas de serveur applicatif ni de base de données distante pour le prototype. Stockage local uniquement pour préférences et journal de mesures de test; proposer un bouton clair pour tout supprimer.
- Utilise une architecture modulaire, avec un contrôleur central et des services indépendants: `VisionService`, `OcrService`, `SpeechRecognitionService`, `TextToSpeechService`, `SoundDetectionService`, `GloveService`, `DroneSimulator`, `SettingsService` et `TestLogService` (ou noms équivalents). Les interfaces doivent permettre de remplacer plus tard les simulations par des adaptateurs matériels réels sans réécrire les écrans.
- Crée des états réalistes: repos, demande de permission, écoute/capture active, chargement, résultat, résultat incertain, erreur, appareil non disponible et mode démo.
- N’expose pas de clés secrètes côté client. Si une intégration nécessite une clé API, indique les variables d’environnement nécessaires et présente une solution de démonstration locale quand la clé manque. Ne prétends pas que l’IA fonctionne si aucun service ou modèle n’est branché.
- Utilise des composants réutilisables, des icônes cohérentes et des formulaires accessibles. Évite les éléments décoratifs qui prennent la place des actions utiles.

### 3. Identité visuelle et ergonomie

Nom affiché: **SENSEBRIDGE**. Signature possible: **Bridging sensory and communication barriers**. Interface en français, avec accents corrects, formulations simples et courtes.

Utilise en priorité la palette fournie dans le dossier:

- Bleu nuit `#102A43`: texte principal et éléments principaux.
- Turquoise `#007C91`: boutons principaux et actions.
- Blanc `#FFFFFF`: arrière-plan.
- Orange foncé `#B54708`: alertes importantes.
- Vert foncé `#237A57`: confirmations et états réussis.

La maquette HTML existante a une ambiance sombre bleu profond et turquoise. Tu peux reprendre cette ambiance pour un thème sombre optionnel, mais conserve la palette officielle, un contraste lisible et un thème clair confortable comme base. N’utilise jamais la couleur seule pour transmettre une information. Chaque alerte doit inclure un texte et une icône ou un libellé; les messages importants peuvent aussi être lus à voix haute ou confirmés par vibration.

Règles UX et accessibilité:

- Conception mobile-first; excellente adaptation aux petits écrans, tablettes et ordinateurs.
- Navigation persistante et cohérente, zones tactiles larges (viser au moins 44 × 44 px), titres explicites et peu d’étapes.
- Boutons avec verbes concrets, libellés et noms accessibles; aucun bouton sans action réelle.
- Contraste fort, texte redimensionnable, mise au point clavier visible, ordre de tabulation logique, HTML sémantique, attributs ARIA utiles et annonces de changements d’état via régions `aria-live`.
- Compatibilité avec lecteurs d’écran et navigation clavier. Ne pas dépendre d’un geste complexe ou du glisser-déposer.
- Préférences réglables: contraste renforcé, taille du texte, retour vocal, retour vibratoire et thème clair/sombre. Mémoriser les réglages localement.
- Réduire les animations; ne pas faire clignoter les alertes.
- Prévoir des écrans et messages de chargement, permission refusée, absence de réseau, microphone/caméra indisponible, erreur et fonctionnement simulé.

### 4. Structure de navigation

Créer une barre de navigation claire avec les sections suivantes:

1. **Accueil**
2. **Voir** (assistance visuelle)
3. **Écouter** (assistance auditive et communication)
4. **Gant**
5. **Drone**
6. **Réglages**

Sur mobile, la navigation peut être une barre inférieure compacte avec libellés et icônes; offrir aussi un accès simple aux sections secondaires. Sur grand écran, utiliser une barre latérale ou une navigation supérieure sans changer la logique.

### 5. Écran Accueil

Présenter le logo/nom, un message d’accueil court et des cartes larges permettant de choisir rapidement un parcours:

- **Assistance visuelle** — « Décrire une scène ou lire un texte imprimé. »
- **Assistance auditive** — « Suivre une conversation, détecter certains sons et répondre par texte ou voix. »
- **Gant intelligent** — « Essayer les commandes gestuelles virtuelles. »
- **Drone** — « Ouvrir le simulateur de pilotage. »

Afficher de manière discrète mais visible le statut **Mode démonstration** lorsqu’aucun appareil réel n’est connecté. Ajouter un accès rapide aux réglages d’accessibilité. Ne pas laisser croire que l’application assure la sécurité de déplacement.

### 6. Section Voir — assistance visuelle

Créer un parcours de capture accessible comportant:

- Un bouton **Prendre une photo** qui demande la permission caméra uniquement après une action explicite de la personne.
- Une option **Importer une image** pour tester sans caméra.
- Une zone de prévisualisation et une consigne pour cadrer la scène.
- Un bouton séparé **Décrire la scène** et un bouton **Lire le texte imprimé (OCR)**.
- Un bouton **Lire le résultat à voix haute**, ainsi que pause/reprise/arrêt de la lecture si le navigateur le permet.
- Un bouton pour répéter le dernier résultat, également utilisable par la commande du gant.
- Un indicateur de progression et une explication si le modèle est en cours de chargement ou si une connexion Internet est requise.

Pour la description d’image, si une vraie analyse n’est pas configurée, offrir un mode démo avec une image d’exemple et un résultat explicitement marqué **Exemple simulé**. Si un modèle de détection d’objets est intégré, décrire simplement les objets courants détectés et leur position approximative (**à gauche**, **au centre**, **à droite**); ne pas prétendre comprendre parfaitement toute la scène. Signaler les résultats peu sûrs avec des formulations comme « peut-être » ou « résultat incertain ». Ne pas affirmer qu’un objet est absent simplement parce qu’il n’est pas détecté.

Pour OCR, afficher le texte reconnu dans une zone lisible, permettre de le corriger/copier, puis le lire à voix haute. Distinguer clairement texte reconnu et texte corrigé par l’utilisateur. Si possible, détecter une image trop sombre ou floue et proposer de reprendre la photo; si cette vérification n’existe pas, ne pas simuler une détection automatique.

Quand la personne quitte cette section, arrêter le flux caméra et libérer la ressource. Aucune photo ne doit être enregistrée ou envoyée sans action et consentement explicites.

### 7. Section Écouter — transcription et communication

Créer deux fonctions distinctes:

**Transcription en direct**

- Bouton explicite **Démarrer la transcription**, puis bouton très visible **Arrêter**.
- Demander l’accès au microphone uniquement au démarrage. Montrer clairement quand le microphone est actif; le couper à l’arrêt et à la sortie de l’écran.
- Afficher la transcription en grands caractères, avec phrases récentes bien séparées et possibilité de vider le texte.
- Indiquer que la reconnaissance du navigateur peut envoyer l’audio à un service externe (par exemple Google Chrome) et peut faire des erreurs. Ne jamais laisser croire que l’audio reste toujours local si ce n’est pas garanti.
- État indisponible avec aide simple si le navigateur ne prend pas en charge la reconnaissance vocale.

**Répondre**

- Champ de saisie simple et accessible.
- Bouton **Afficher en grand** pour présenter la réponse à une autre personne.
- Bouton **Lire ma réponse à voix haute** avec arrêt/reprise lorsque possible.
- Rendre le texte facile à effacer.

**Détection de sons (expérimentale)**

- Présenter des sons ciblés comme une sonnette ou un minuteur uniquement si une solution réelle est intégrée; sinon, proposer une démonstration explicitement simulée.
- Contrôle de démarrage/arrêt et témoin du microphone actif.
- Pour toute détection, afficher une bannière avec le nom du son et un niveau de confiance ou la mention **détection incertaine**, et permettre une vibration si supportée.
- Mentionner que la fonction peut manquer un son ou produire une fausse alerte et ne doit pas servir d’alarme de sécurité.

### 8. Section Gant intelligent

Le gant matériel prioritaire envisagé utilise une carte ESP32, un capteur de mouvement MPU6050, un moteur vibrant et Bluetooth Low Energy (BLE). Le matériel peut ne pas être disponible: par défaut, construire un **gant virtuel** pleinement testable.

Créer une interface comprenant:

- Statut textuel et visuel: **Gant virtuel actif**, **Gant BLE connecté**, **Déconnecté**, ou **Démonstration**. Ne jamais afficher « connecté » sans connexion réelle.
- Boutons de simulation clairement marqués:
  1. **Double secousse — Décrire la scène**: déclenche la même action que le bouton de description visuelle.
  2. **Coup de poignet — Répéter le dernier résultat**: relit ou réaffiche le dernier résultat disponible.
- Une brève confirmation vibratoire après réception si l’appareil le permet; en mode virtuel, afficher **Vibration simulée** plutôt que prétendre vibrer réellement. Pour distinguer les commandes, une vibration courte correspond au geste 1 et deux vibrations au geste 2, si l’API le permet.
- Si les capteurs de mouvement du téléphone sont simulés ou utilisés, demander la permission du navigateur, expliquer son usage et proposer les boutons comme solution alternative. Ajouter une zone morte et une confirmation afin d’éviter les gestes accidentels.
- Préparer un adaptateur `GloveService` qui accepte les mêmes événements, qu’ils viennent des boutons, des capteurs du téléphone ou d’un futur BLE. Prévoir un écran d’association BLE informatif, mais ne jamais inventer de périphérique ni déclarer l’appairage réussi sans événement navigateur réel et autorisé.
- Expliquer clairement: **Ce gant transmet des commandes simples; il ne traduit pas la langue des signes.**

### 9. Section Drone — simulation uniquement

Le drone est une idée complémentaire absente du périmètre initial obligatoire. Pour cette version, il doit rester **uniquement une simulation visuelle**, sans contrôle de drone réel ni demande de connexion matérielle.

Créer une simulation 2D soignée, tactile et accessible, avec vue de dessus:

- Terrain délimité, point de départ, drone, trajectoire, trois obstacles fixes, légende et orientation nord.
- Statut **SIMULATION — aucun drone réel connecté** constamment visible.
- Mesures simulées: batterie, altitude, qualité du signal du gant et état du drone.
- Commandes: avancer, reculer, gauche, droite, stabiliser, monter, descendre, décoller, atterrir, **Retour au point de départ** et **Arrêt d’urgence**.
- Les commandes doivent agir sur la simulation (position, altitude, statut), pas seulement changer un texte. Bloquer la progression si un obstacle ou une limite est atteint et expliquer pourquoi. Ajouter une zone morte pour les commandes d’inclinaison afin de limiter les mouvements accidentels.
- Mode pilotage gant virtuel: inclinaison simulée via contrôles accessibles; geste 1 bascule entre décollage et atterrissage; geste 2 déclenche l’arrêt d’urgence. Expliquer que le sens des gestes change en mode pilotage.
- Sécurité simulée: avertir avant un obstacle proche; bloquer le déplacement en cas de collision; en cas de perte simulée de liaison, vol stationnaire après 1,5 seconde sans signal et atterrissage après 5 secondes; atterrissage automatique en cas de batterie critique. Les états et comptes à rebours doivent être visibles et annoncés avec texte, et vibration simulée si activée.
- États recommandés: **Au sol**, **En vol**, **Vol stationnaire**, **Atterrissage**. Contrôler les transitions; le retour maison ramène le drone au point de départ dans la simulation.
- Ajouter un bouton **Réinitialiser la simulation** et un journal des événements récents.
- Ajouter un avis clair: « Simulation seulement. Un vol réel ne doit pas être effectué seul; il nécessiterait supervision adaptée et vérification des règles locales. » Aucun bouton ne doit envoyer de commande à un appareil réel.

### 10. Lunettes connectées — extension expérimentale

Prévoir dans la section Voir ou dans une page **Appareils** un encart **Capture mains libres (expérimental)**:

- Expliquer que le projet envisage une caméra de lunettes, par exemple un module ESP32-CAM, envoyant une image au téléphone pour traitement.
- Dans cette version, proposer uniquement la caméra du téléphone ou une simulation explicitement identifiée si aucune caméra lunettes réelle n’est disponible.
- Ne pas afficher de connexion réussie sans connexion effective. La transmission Wi-Fi depuis ESP32-CAM est à réaliser plus tard et ne doit pas être inventée.
- Aucun écran intégré dans les verres n’est requis.

### 11. Réglages, vie privée et données

Créer une page de réglages pour:

- Contraste renforcé, taille de texte, thème, retour vocal et retour vibratoire.
- Choix de la langue de reconnaissance vocale si le navigateur le prend en charge; français par défaut.
- Statut et informations des permissions caméra, microphone, mouvements et vibration, sans demander les permissions à l’ouverture de l’application.
- Résumé compréhensible des traitements: caméra et micro activés seulement à la demande; service externe potentiellement utilisé pour la reconnaissance vocale; téléchargement Internet éventuel des modèles; aucune conservation de photo, d’audio ou de position par défaut.
- Journal local de mesures de test (durées, résultats anonymisés ou actions de démo) si nécessaire, avec bouton **Effacer les données locales** et demande de confirmation.
- Bouton pour réinitialiser les préférences.

Ne crée pas de compte utilisateur, de suivi publicitaire, d’analytique distante ni de stockage d’images, d’audio ou de position par défaut.

### 12. Limites, sécurité et langage

Afficher à un endroit approprié, sans empêcher l’usage normal: **SENSEBRIDGE est une aide complémentaire. Le prototype ne garantit pas la détection de tous les objets, obstacles ou sons et ne remplace ni une canne blanche, ni un chien guide, ni une alarme certifiée, ni un interprète professionnel.**

Règles de contenu:

- Signaler clairement les résultats incertains et les simulations.
- Ne jamais annoncer une précision, une sécurité ou une connexion non vérifiée.
- Pas de traduction automatique complète de langue des signes dans cette version.
- Pas de navigation cartographique ni de signalement communautaire obligatoire; ces fonctions sont optionnelles et hors priorité.
- Messages d’erreur utiles, calmes, sans jargon, avec une action possible pour continuer.

### 13. Écran À propos et démonstration

Ajouter une page ou un panneau **À propos du prototype** qui présente SENSEBRIDGE, le but universitaire, les modules disponibles, ceux en simulation et ceux prévus plus tard. Inclure une commande **Réinitialiser la démonstration** afin de revenir à l’état initial pour une présentation.

Inclure un petit tableau de bord de validation permettant de parcourir les scénarios suivants et de noter localement le résultat, sans prétendre que les tests ont déjà été effectués:

1. Décrire une image contenant des objets connus.
2. Photographier et lire un texte imprimé.
3. Prononcer plusieurs phrases et comparer la transcription.
4. Essayer des alertes sonores en environnement contrôlé; noter sons manqués et fausses alertes.
5. Envoyer les deux commandes du gant virtuel et vérifier l’action correspondante.
6. Vérifier la confirmation vibratoire réelle ou simulée.
7. Vérifier la capture lunettes uniquement si un module est effectivement disponible; sinon marquer **Non réalisé / matériel indisponible**.
8. Parcourir les écrans au clavier et avec un lecteur d’écran.
9. Tester erreurs réseau, image floue et composants indisponibles.

### 14. Critères de réalisation

Livre une application cohérente et navigable, pas une simple page de présentation ni un assemblage de cartes sans interaction. Chaque bouton doit fonctionner, ou porter explicitement la mention **Bientôt disponible** avec une explication. L’utilisateur doit pouvoir essayer le parcours de démonstration sans matériel et savoir à tout moment si une fonction est réelle, simulée ou indisponible.

Avant de terminer:

- Vérifie les parcours sur petit écran et grand écran.
- Vérifie clavier, libellés accessibles, contraste et taille des zones tactiles.
- Vérifie que caméra et microphone ne s’activent qu’après demande explicite et s’arrêtent correctement.
- Vérifie qu’aucune interface n’annonce un matériel connecté ou une analyse réelle quand c’est simulé.
- Affiche des états vides, erreurs, permissions refusées et absence de réseau.
- Garde les noms de fonctions et les textes en français correct.

Commence par livrer les écrans et interactions fonctionnelles avec les adaptateurs en mode démo; organise le code pour brancher les services réels plus tard. Si une fonction ne peut pas être réalisée de façon fiable dans le navigateur, construis un écran d’état honnête et une démonstration simulée clairement étiquetée au lieu de fabriquer un résultat.

---

## Fin du prompt

### Conseils d’utilisation

1. Dans Vercel v0, crée un nouveau projet et colle le prompt complet ci-dessus.
2. Ajoute la maquette HTML et l’icône comme références si l’interface le permet.
3. Demande d’abord à v0 de générer l’application complète avec les simulations; ensuite, demande des corrections ciblées écran par écran.
4. Avant de présenter le projet comme terminé, essaie les fonctions sur un téléphone réel: les permissions caméra/micro et certaines fonctions du navigateur varient selon l’appareil.

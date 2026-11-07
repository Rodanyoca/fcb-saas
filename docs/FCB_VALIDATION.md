# FCB : validation et point de reprise

## Lot 1 - Listes territoriales (7 novembre 2026)

Objectif : ouvrir Ligues, Ententes puis Clubs sous session FCB, lire deux classeurs FCB et afficher leurs vraies lignes. Les listes conservent le tableau, recherche, filtres, tri, pagination, cartes mobiles et navigation FECOT. Les fiches restent en consultation heritee ; leurs formulaires et toutes les mutations sont desactives jusqu'a la validation des listes par l'utilisateur.

### Depots et configuration constates

- Cible Git reelle : C:/Projets/SNDS-RDC/data/monosport/fcb-managment.
- Reference Git reelle, lecture seule : C:/Projets/SNDS-RDC/data/monosport/fecot-managment.
- FCB et FECOT ont tous deux origin=https://github.com/Rodanyoca/fecot-saas.git. Aucun remote modifie : le depot distant FCB n'a pas ete fourni. Aucun push. Cette liaison heritee doit etre corrigee avec la destination validee avant un futur envoi.
- Etat initial FCB : README.md et package-lock.json deja modifies ; application, composants, documentation, configuration et tests deja non suivis. Aucune restauration ni suppression. Etat initial FECOT : docs/identifiants-athletes.md modifie ; aucun fichier reference modifie.
- Aucun AGENTS.md initial trouve dans les deux depots et les repertoires parents applicables inspectes. Next 16.3.8 a genere AGENTS.md et CLAUDE.md au demarrage ; instructions lues et guides locaux proxy/distDir consultes. Les caches de FCB sont desormais isoles dans .next-fcb.
- Pas de liaison locale .vercel ni de vercel.json dans FCB. L'etat de liaison Vercel cote cloud n'a pas ete verifie ; l'absence locale ne prouve pas l'absence d'une integration Git distante. Aucune commande Vercel, aucun deploiement.
- .env.local copie depuis FECOT : variables de classeurs FECOT, identifiants Google et deux secrets d'authentification identiques a la reference (comparaison booleenne uniquement). Variables FCB_STRUCTURE_TERRITORIALE_SPREADSHEET_ID, FCB_REFERENTIELS_SPREADSHEET_ID et FCB_USERS_SPREADSHEET_ID absentes au controle initial. Aucun secret affiche ou modifie.

### Ecart court et decisions

| Element FECOT | Traitement FCB de ce lot |
| --- | --- |
| Tableaux, recherche, filtres, tri, pagination, cartes mobiles, navigation Ligues -> Ententes -> Clubs | Reutilises avec libelles FCB. Aucun nouveau logo officiel invente ; marque textuelle FCB. |
| Modeles territoriaux enrichis avec sigles, dates, telephone, code_club, logos | Lecture adaptee aux colonnes historiques FCB. Les colonnes absentes ne sont pas exigees ni ecrites. |
| Formulaires et generateur UUID herites | Indisponibles. Au lot 2, adapter les champs reellement disponibles et les IDs numeriques composes avant activation. |
| Droits AUT-SPT, session, origine des mutations, absence de repli fictif | Conservent leurs regles. Seuls le nom du cookie (fcb_session) et la variable source utilisateurs FCB sont isoles pour ne pas reutiliser les sessions/comptes FECOT. |
| Uploads de logos, comptes utilisateurs, authentification nouvelle | Hors perimetre ; uploads herites refuses avant tout appel Drive. Aucun compte cree ou modifie. |
| Autres blocs | Lots suivants, pas de raccordement premature. Licences affiche exactement le message d'attente FCB, sans lire de registre. |

### Sources et mapping reel

Lecture metadata puis plages bornees via connecteur Google Drive, sans aucune ecriture. Capture de controle dans tests/data/fcb-territory.json, uniquement territoire et referentiels publics de ce lot. L'application n'importe jamais cette capture : elle lit Google Sheets avec un scope readonly et verifie strictement les deux IDs FCB.

Territoire : 16Z8zzPSne-nQ-XpAV-ifaaKuQ95GOeiI90dKRByYKtw (01_FCB_STRUCTURE_TERRITORIALE).
Referentiel : 1r5BQir1NTTInKTo7mcjtLMbV4AAaHc7LYDcbElIkjJ8 (00_FCB_REFERENTIEL).

| Feuille | En-tetes reels | Adaptation en lecture |
| --- | --- | --- |
| LIGUES | id_ligue, nom_ligue, pseudo_ligue, email_ligue, id_province, statut, observations | pseudo_ligue -> sigleLigue ; email_ligue -> emailLigue ; ID texte preserve. |
| ENTENTES | id_entente, code_entente, nom_entente, pseudo_entente, id_ligue, id_ville, email_entente, statut, observations | pseudo_entente -> sigle/pseudo ; email_entente -> email ; parents resolus par ID. |
| CLUBS | id_club, nom_club, id_categorie, id_sexe, date_affiliation, id_ville, id_entente, id_ligue, statut, observations | id_categorie alias de categorie club ; ligue deduite de l'entente ; id_ligue stocke conserve pour diagnostic d'incoherence. |

PROVINCES : id_province, nom_province, statut, observations (26 lignes). VILLES : id_ville, id_province, nom_ville, statut (36 lignes). CATEGORIES_CLUB : id_categorie_club, nom_categorie_club, observations (4 lignes). SEXES : id_sexe, nom_sexe, observations (3 lignes).

LIGUES A1:G1000 : exactement 26 lignes, codes 01 a 26 inchanges, statuts vides preserves (affiches sans badge actif). ENTENTES A1:I1000 : 0 ligne ; CLUBS A1:J429 : 0 ligne. Les en-tetes presents avec zero ligne produisent un etat vide ; une lecture impossible ou des en-tetes invalides donnent une erreur, sans tableau vide trompeur ni demo.

CLUBS ne contient pas code_club. La creation d'un club restera indisponible tant que cette colonne n'aura pas ete ajoutee au classeur dans une intervention explicitement autorisee et que le service n'aura pas ete adapte. Aucune colonne ajoutee ici, et aucun code local reconstruit en guise de colonne source. Pour le lot formulaires, IDs attendus selon les exemples fournis : ligue 01, code entente 02 -> ID 0102 ; code club 001 -> ID 0102001. Modification : ID existant conserve. Pas de rattachement direct club -> ligue invente.

### Fichiers et optimisations

lib/fcb-territorial-source.ts : schema de lecture et garde des IDs FCB. lib/territorial-store.ts : deux lectures batch (trois feuilles territoriales et quatre referentiels), FORMATTED_VALUE, plages limitees aux colonnes utilisees, scope readonly. lib/territorial-data.ts : mutualisation par requete et cache 30 s propre a FCB. lib/territorial-view-model.ts : alias, resolution par ID et diagnostics des parents manquants/incoherents sans masquer le club.

components/territorial : distinction chargement/erreur/vide et ecriture toujours desactivee ; les API de mutation et le writer refusent toute ecriture. La route d'upload de logo refuse les nouveaux medias. .env.example contient les noms effectivement utilises, vides. Les noms des variables FECOT de territoire ne sont plus consommes ; l'ancien FECOT_USERS_SPREADSHEET_ID ne sert que de garde anti-reutilisation, jamais de source de repli.

### Variables a renseigner et blocage actuel

Dans data/monosport/fcb-managment/.env.local :

| Variable | Role / action requise |
| --- | --- |
| FCB_STRUCTURE_TERRITORIALE_SPREADSHEET_ID | ID territorial FCB indique ci-dessus. |
| FCB_REFERENTIELS_SPREADSHEET_ID | ID du referentiel FCB indique ci-dessus. |
| FCB_USERS_SPREADSHEET_ID | Classeur utilisateurs propre a FCB, accessible au compte de service. Aucun ID fourni pour ce bloc ; ne pas reprendre celui de FECOT. |
| AUTH_SECRET | Nouveau secret aleatoire propre a FCB, au moins 32 caracteres. |
| AUTH_TELEMETRY_HMAC_KEY | Second nouveau secret aleatoire FCB distinct, au moins 32 caracteres. |

GOOGLE_CLIENT_EMAIL et GOOGLE_PRIVATE_KEY sont presents ; le compte de service est partage avec la reference. Sa permission sur les classeurs FCB reste a verifier via le SDK apres confirmation de configuration. Le partage technique du compte ne remplace jamais le controle de cible par ID.

Question envoyee a l'utilisateur : confirmer l'ajout des trois variables FCB et le remplacement des deux secrets, sans les communiquer dans le chat. Tests Google/app authentifiee dependants en attente de cette confirmation, selon sa consigne. Aucune creation de classeur utilisateurs ni intervention sur les comptes dans ce lot.

### Tests reellement executes

- Lecture reelle par connecteur : metadata, en-tetes, 26 ligues, listes Ententes/Clubs vides et quatre referentiels confirms. Aucune ecriture Google.
- 23 tests cibles passes : mapping FCB, aliases, identifiants avec zeros, absence de code_club invente, ligue deduite et incoherence conservee, parents manquants, erreurs de schema, refus des mauvaises cibles, cookie FCB, droits AUT-SPT et resolution de session fail-closed. Commande : node --experimental-strip-types --test tests/fcb-territorial-read.test.ts tests/unit/fecot-session-cookie.test.ts tests/unit/session-resolution.test.ts tests/unit/authorization-matrix.test.ts tests/territorial-permissions.test.ts.
- npm.cmd run lint : code 0. Dans ce depot, lint est un alias npm run typecheck ; il s'agit du TypeScript global, pas d'une execution ESLint distincte.
- node scripts/fcb-lists-ui-qa.mjs : code 0. Vrais composants FCB et capture Drive isoles dans un bundle esbuild, reseau coupe : pagination 10/10/6, recherche Kinshasa, filtre Kwango, ID 01/02, aucun statut actif invente, aucune action Ajouter/Modifier, ordre de navigation, etats vides, erreur sans faux tableau vide, mobile 390 px sans debordement et aucune erreur JS. Ce test ne vaut pas validation d'une session FCB ni de la connexion SDK.
- Captures dans test-results/fcb-lists/ (ignore Git). Ligues desktop, Clubs vide et Ligues mobile examines visuellement ; style territorial FECOT conserve. CSS existant reutilise pour le controle isole, sans build complet.
- Serveur Next local demarre a 127.0.0.1:3047 avec cache .next-fcb. Le port 3037 etait deja utilise : aucun processus existant arrete. GET /ligues anonyme : 307 vers /login ; GET /api/ligues anonyme : 401. Pas de contournement des protections.
- Build complet non lance : reserve a un ensemble coherent apres configuration et validation de ce premier lot. Aucun test de mutation, aucune ecriture distante, aucun push ni deploiement.

### Point de reprise exact et lots suivants

1. Attendre confirmation des variables FCB et secrets propres, redemarrer le serveur si necessaire ; verifier SDK en lecture seule puis ouvrir les trois listes avec une session FCB autorisee. URLs locales : http://127.0.0.1:3047/ligues, /ententes et /clubs. L'utilisateur valide les listes avant le lot formulaires. Pour l'instant les URLs restent protegees par la connexion.
2. Apres validation : fiches et formulaires territoriaux, seulement colonnes existantes ; controles de parents/unicite ; IDs composes et immuables. Creation club bloquee tant que code_club n'est pas adapte au schema. Relire les en-tetes avant toute activation, tester les mutations uniquement en memoire ou classeur de test autorise.
3. Acteurs : lire les en-tetes des six feuilles FCB avant raccordement, dont Feuille 2 pour Autres ; aliases dates/passeport, ID federal, id_iba facultatif, aucun id_national interprete comme licence, aucun avatar ni upload.
4. Affiliations : Boxeur puis coach/medecin ; prendre id_affiliation, id_saison et statut_affiliation dans les trois feuilles historiques. Historique, ajout, correction, fin explicite ; pas de transfert ou renouvellement importe, clubs inactifs/renommes/introuvables conserves. Mandats separes.
5. Competitions : edition -> epreuve -> boxeurs -> phase -> combat -> resultat ; commencer en amateur, referentiel categories vide explicite, reglement fourni, decisions officielles sans vainqueur deduit des scores. Recette simulee aux points et arret sans score. Aucun moteur de reglement/classement automatique.
6. Activites puis Documents : lire leurs en-tetes historiques, adapter les relations et conserver les droits des liens existants, aucun upload. Licences reste uniquement : Le module Licences FCB sera disponible prochainement. Aucun appel au registre prepare.

Les classeurs des lots 3 a 6 n'ont pas encore ete lus ni raccordes dans cette premiere livraison. Authentification nouvelle, gestion des utilisateurs et medias restent hors perimetre. Les instructions de l'ancien docs/structure-territoriale.md sont un historique FECOT, pas une autorisation de modification des classeurs FCB.

Controle final : npm.cmd run lint/typecheck code 0 apres demarrage Next et les derniers libelles. GET /login : 200 ; GET /ententes et /clubs anonymes : 307 vers /login. Le serveur 127.0.0.1:3047 est laisse actif pour la verification utilisateur. Aucun test SDK/connecte sous session n’a ete lance en l’absence de confirmation des variables.

## Publication Git demandee par l’utilisateur

Apres le lot de lecture seule, l’utilisateur a explicitement demande la publication sur https://github.com/Rodanyoca/fcb-saas.git, branche main. Le remote origin herite de FECOT est remplace par cette destination. Les sources, tests et documents sont inclus ; .env.local, caches, node_modules et resultats de tests restent ignores. Cette publication ne valide pas les variables FCB encore attendues et ne comprend aucune commande de deploiement.

# FCB - Federation congolaise de boxe

Premier lot : listes Ligues, Ententes et Clubs, en lecture seule. Reference FECOT consultee sans modification. Voir [le mapping, les ecarts et le point de reprise](docs/FCB_VALIDATION.md).

Configuration : renseigner les variables FCB de [.env.example](.env.example) dans `.env.local`, avec un classeur utilisateurs et des secrets propres a FCB. Les anciennes variables FECOT ne servent jamais de repli. Les protections existantes restent actives. Aucune creation de compte n'est effectuee par ce lot.

Serveur local pour la verification : `node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3047` puis http://127.0.0.1:3047/ligues. Sans session FCB, les pages redirigent vers la connexion et les API refusent l'acces.

Tests independants : `node --experimental-strip-types --test tests/fcb-territorial-read.test.ts`, `node scripts/fcb-lists-ui-qa.mjs`, `npm.cmd run lint` (alias TypeScript du depot). Le test navigateur isole utilise la capture publique du territoire FCB dans tests/data/fcb-territory.json ; il ne remplace jamais la source de l'application.

Les mutations territoriales et les nouveaux televersements sont desactives. Les formulaires feront l'objet du lot suivant apres validation des listes. Aucun push ni deploiement.

<details><summary>Archive du README herite de FECOT - ne constitue pas la configuration FCB</summary>

# FECOT - Federation congolaise de taekwondo

Application Next.js avec le bloc territorial porté depuis FEVOCO : ligues, ententes et clubs, listes, fiches, formulaires latéraux, recherches, filtres, tris, pagination et logos Drive. Connexion, activation, sessions et droits AUT-SPT également portés à la demande de l’utilisateur.

## Demarrage

```powershell
npm.cmd install
npm.cmd run dev
```

Ouvrir http://localhost:3000. Si le port est occupe, Next.js indique le port disponible.

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

## Configuration et périmètre

Renseigner les variables décrites dans [.env.example](.env.example) dans votre environnement ou votre fichier `.env.local`. Les valeurs du modèle sont volontairement vides. Aucun secret ni compte d’un autre dépôt n’est réutilisé.

La connexion exige un classeur utilisateurs FECOT, deux secrets indépendants et les accès Google. Le bloc territorial exige son classeur et le référentiel FECOT ; les logos nécessitent la configuration OAuth Drive. Sans configuration, l’application refuse l’accès et affiche une indisponibilité explicite.

Voir [le rapport et le guide de configuration](docs/structure-territoriale.md) pour les IDs des deux classeurs FECOT vérifiés, le modèle des données, la préparation du classeur utilisateurs et la création du premier administrateur.

Le bloc Acteurs et affiliations n’est pas encore intégré ; ses sections dans les fiches territoriales affichent un état explicite. Les autres modules restent en préparation. Aucun jeu de données métier fictif n’est utilisé dans l’application, aucune équipe ou division n’est ajoutée. Aucun logo officiel FECOT n’a été fourni ; la marque reste textuelle.

## Vérifications

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:ui
node scripts/auth-ui-qa.mjs
```

Les tests UI utilisent Chromium local : `npx.cmd playwright install chromium` si nécessaire. Le test territorial est isolé : il part d’une lecture réelle des 26 ligues FECOT et conserve toutes les écritures de test en mémoire. Les comparaisons supposent le dépôt FEVOCO présent dans le même workspace.

</details>

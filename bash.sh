# 1. Download script to local file
curl -fsSL https://chatgpt.com/codex/install.sh -o install.sh

# 2. Inspect the script content
less install.sh

# 3. Execute after auditing
sh install.sh
git branch -m agent/increase-plugin-share-archive-limit codexlmlm
git fetch origin
git branch -u origin/codexlmlm codexlmlm
git remote set-head origin -a
cd lmlm-dashboard
npm install
npm run typecheck
npm run build
npm run dev
# open http://localhost:5173/lmlm

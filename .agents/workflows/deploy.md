---
description: Push changes to the cha-da-vitalidade GitHub Pages site
---

# Deploy Chá da Vitalidade to GitHub Pages

// turbo-all

1. Add all changed files to git staging
```
& "C:\Program Files\Git\cmd\git.exe" add index.html style.css script.js
```

2. Commit with a descriptive message
```
& "C:\Program Files\Git\cmd\git.exe" commit -m "Atualização do site"
```

3. Push to GitHub (this updates the live site automatically)
```
& "C:\Program Files\Git\cmd\git.exe" push origin main
```

The site will be live at: https://kmbcorporationltda-cmyk.github.io/cha-da-vitalidade/

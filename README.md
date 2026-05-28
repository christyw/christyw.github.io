# Christiana Wong — Personal Gallery Website

A horizontal-scroll museum experience. Navigate left and right through rooms like walking the ground floor of a museum.

## How to Get This Live (GitHub Pages — Free)

### Step 1: Create a GitHub Account
Go to [github.com](https://github.com) and sign up for a free account if you don't have one.

### Step 2: Create a New Repository
1. Click the **+** button (top right) → **New repository**
2. Name it exactly: `your-username.github.io`  
   *(replace "your-username" with your actual GitHub username)*
3. Set it to **Public**
4. Click **Create repository**

### Step 3: Upload Your File
1. In your new repository, click **Add file** → **Upload files**
2. Drag and drop `index.html` from this folder
3. Scroll down, click **Commit changes**

### Step 4: Your Site is Live!
Wait 1–2 minutes, then visit:  
`https://your-username.github.io`

That's it. Free hosting, forever.

---

## Connecting Your Custom Domain

### In GitHub:
1. Go to your repository → **Settings** → **Pages**
2. Under "Custom domain", type your domain (e.g. `christianawong.com`)
3. Click **Save**
4. GitHub will show you some DNS records to add

### In Your Domain Registrar (Namecheap, GoDaddy, Google Domains, etc.):
Add these DNS records (GitHub provides the exact values, but typically):

| Type  | Host | Value                |
|-------|------|----------------------|
| A     | @    | 185.199.108.153      |
| A     | @    | 185.199.109.153      |
| A     | @    | 185.199.110.153      |
| A     | @    | 185.199.111.153      |
| CNAME | www  | your-username.github.io |

Wait up to 24 hours for DNS to propagate. GitHub will automatically give you HTTPS (the padlock).

---

## Navigating the Gallery
- **Arrow buttons** on screen
- **Keyboard** ← → arrow keys
- **Touch/swipe** on mobile
- **Nav bar** room names at the top
- **Dots** at the bottom

## Rooms
1. Entrance Hall — fountain courtyard
2. About — Detroit & Yale
3. Interests — sports, books, cooking
4. Professional — Airbnb.org
5. Travel — sunrise hike excerpt
6. Writing — notebook
7. Contact — exit hall

## Editing Content
Open `index.html` in any text editor (TextEdit, Notepad, VS Code) and find the room you want to edit. Each room is clearly marked with comments like `<!-- ROOM 1 · ABOUT -->`.

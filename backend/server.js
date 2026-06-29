require("dotenv").config();
const crypto = require("crypto");
const { promisify } = require("util");
const scryptAsync = promisify(crypto.scrypt);

const express = require("express")
const multer = require("multer")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt")
const path = require("path");
const db = require("./db");
const PORT = 3001

const app = express();

const cors = require("cors");


async function deriveKeyFromPassword(password, salt) {
  const key = await scryptAsync(password, salt, 32);
  return key;
}

function generateSalt() {
  return crypto.randomBytes(16); // 128-bit salt
}

function encryptFile(buffer, key){
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    return {
        encrypted,
        iv,
        authTag
    };
}

function decryptFile(encrypted, iv, authTag, key) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
}





const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 100 * 1024 * 1024 },
});



app.use(cors());

// app.use(cors({
//   origin: "http://localhost:3000"
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is running");
});


app.post("/upload", upload.single("file"), async(req, res) => {
    try{
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const id = uuidv4();
        const expiresIn = Number(req.body.expires);
        if (!expiresIn || expiresIn <= 0) {
            return res.status(400).json({ error: "Invalid expiry time" });
        }
        const expiresAt = Date.now() + expiresIn * 1000;

        const ext = path.extname(req.file.originalname);
        const finalPath = path.join("uploads", id + ext);
        
        const fileBuffer = fs.readFileSync(req.file.path);
        const salt = generateSalt();
        const key = await deriveKeyFromPassword(req.body.password, salt);
        const { encrypted, iv, authTag } = encryptFile(fileBuffer, key);
        fs.writeFileSync(finalPath, encrypted);
        fs.unlinkSync(req.file.path);



        db.run(`INSERT INTO uploads (id, path, expires_at, iv, auth_tag, original_name, salt) VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, finalPath, expiresAt, iv.toString("hex"), authTag.toString("hex"), req.file.originalname, salt], (err) => {
            if (err) console.error("DB INSERT ERROR:", err);
        });


        res.json({
            fileId: String(id)
        });
    }
    
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});

app.post("/files/:id/download", (req, res) => {
    const id = req.params.id;
    const providedPassword = req.body.password || "";

    db.get(`SELECT * FROM uploads WHERE id = ?`, [id], async (err, row) => {
        if (err) return res.status(500).send("Database error");
        if (!row) return res.status(404).send("File not found");
        if (row.expires_at < Date.now()) {
            return res.status(410).send("File expired");
        }

        const encryptedBuffer = fs.readFileSync(row.path);
        const key = await deriveKeyFromPassword(providedPassword, row.salt);
        try{
            const decrypted = decryptFile(
            encryptedBuffer,
            Buffer.from(row.iv, "hex"),
            Buffer.from(row.auth_tag, "hex"),
            key
            );
            res.setHeader(
            "Content-Disposition",
            `attachment; filename="${row.original_name}"`
            );
            res.send(decrypted);
        }
        catch(err){
            return res.status(403).send("Incorrect password");
        }

    })
})

app.get("/files/:id/checkexistence", (req, res) => {
    const id = req.params.id;

    db.get(`SELECT * FROM uploads WHERE id = ?`, [id], async (err, row) => {
        if (err) return res.json({ existence: "database error" });
        if (!row) return res.json({ existence: "file not found" });
        if (row.expires_at < Date.now()) {
            return res.json({ existence: "file expired" });
        }

        res.json({ existence: "exists" });
    })
})


setInterval(() => {
  const now = Date.now();
  db.all("SELECT * FROM uploads WHERE expires_at < ?", [now], (err, rows) => {
    if (err) return console.error(err);
    rows.forEach(row => {
      if (fs.existsSync(row.path)) fs.unlinkSync(row.path);
      db.run("DELETE FROM uploads WHERE id = ?", [row.id]);
    });
  });
}, 1000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

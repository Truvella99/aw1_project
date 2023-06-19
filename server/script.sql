BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "pages" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"userId" INTEGER NOT NULL, -- da qui otteniamo autore della pages: users(nome)
	"title"	TEXT NOT NULL,
	"creationDate"	DATE NOT NULL,
	"publicationDate" DATE,
	FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "blocks" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"pageId" INTEGER NOT NULL,
	"type"	TEXT NOT NULL,
	"content"	TEXT NOT NULL,
	"blockOrder" INTEGER NOT NULL,
	FOREIGN KEY("pageId") REFERENCES "pages"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"isAdmin" INTEGER NOT NULL,
	"email" TEXT NOT NULL UNIQUE,
	"username"	TEXT NOT NULL UNIQUE,
	"hash"	TEXT NOT NULL,
	"salt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "website" (
	"name" TEXT PRIMARY KEY
);

-- USERS
-- Enrico, pass (user author of two pages)
-- Giorgio, pass (user who has never created a page)
-- Admin, pass (user with admin privileges)
-- Domenico, pass (other user that owns the remaining pages)
INSERT INTO "users" VALUES (1,0,'enrico@gmail.com','Enrico','fec5af0cd2d70b363744cfa9f8113d6bd8c2d43217efcacd8ee520f305b4e0f1','f96ce3bf59ca10c0');
INSERT INTO "users" VALUES (2,0,'giorgio@gmail.com','Giorgio','6b9e66080c3f65b8fa8e8ea0acd58597567593340fd6e0f040244145455e47c8','24bbf68f9e8cd7ce');
INSERT INTO "users" VALUES (3,1,'admin@gmail.com','Admin','360a8d802d81b6ac3fe7fe235234c8a7937d9d1a2918c92e95642fd241dd34cd','b84ff66a0fbd3268');
INSERT INTO "users" VALUES (4,0,'domenico@gmail.com','Domenico','2eba6059e7068d4536fda5579909f3a50ddb1309ddc8e0666a496df3f1e5c755','04092d55759c35ee');

-- pages1 draft di enrico
INSERT INTO "pages" VALUES (1,1,'pages1',DATE('2023-02-28'),NULL);
INSERT INTO "blocks" VALUES (1,1,'Header','Blog',1);
INSERT INTO "blocks" VALUES (2,1,'Paragraph','Ciao Sono Enrico',2);

-- pages2 draft di domenico
INSERT INTO "pages" VALUES (2,4,'pages2',DATE('2023-03-29'),NULL);
INSERT INTO "blocks" VALUES (3,2,'Header','Gallery',1);
INSERT INTO "blocks" VALUES (4,2,'Image','image1.jpg',2);

-- pages 3 programmata di domenico
INSERT INTO "pages" VALUES (3,4,'pages3',DATE('2023-02-28'),DATE('2023-08-28'));
INSERT INTO "blocks" VALUES (5,3,'Header','Lifestyle',1);
INSERT INTO "blocks" VALUES (6,3,'Paragraph','Mi alleno Spesso',2);

-- pages 4 programmata di domenico
INSERT INTO "pages" VALUES (4,4,'pages4',DATE('2023-03-29'),DATE('2023-08-29'));
INSERT INTO "blocks" VALUES (7,4,'Header','Hobby',1);
INSERT INTO "blocks" VALUES (8,4,'Paragraph','Mi piace Leggere',2);

-- pages 5 pubblicata di domenico
INSERT INTO "pages" VALUES (5,4,'pages5',DATE('2023-02-28'),DATE('2023-06-10'));
INSERT INTO "blocks" VALUES (9,5,'Header','Sport',1);
INSERT INTO "blocks" VALUES (10,5,'Image','image2.jpg',2);

-- pages 6 pubblicata di enrico
INSERT INTO "pages" VALUES (6,1,'pages6',DATE('2023-03-29'),DATE('2023-06-10'));
INSERT INTO "blocks" VALUES (11,6,'Header','Film',1);
INSERT INTO "blocks" VALUES (12,6,'Image','image3.jpg',2);

-- website
INSERT INTO "website" VALUES("CMSMALL");
COMMIT;

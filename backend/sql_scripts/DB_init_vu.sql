IF OBJECT_ID('dbo.vuRECIPE', 'U') IS NOT NULL
ALTER TABLE dbo.vuRECIPE DROP CONSTRAINT vuFK_Recipe_User
IF OBJECT_ID('dbo.vuRECIPE', 'U') IS NOT NULL
DROP TABLE dbo.vuRECIPE
GO

IF OBJECT_ID('dbo.vuPREPARATION', 'U') IS NOT NULL
ALTER TABLE dbo.vuPREPARATION DROP CONSTRAINT vuFK_Preparation_Recipe
IF OBJECT_ID('dbo.vuPREPARATION', 'U') IS NOT NULL
DROP TABLE dbo.vuPREPARATION
GO

IF OBJECT_ID('dbo.vuRECIPECATEGORY', 'U') IS NOT NULL
ALTER TABLE dbo.vuRECIPECATEGORY DROP CONSTRAINT vuFK_RecipeCategory_Recipe
IF OBJECT_ID('dbo.vuRECIPECATEGORY', 'U') IS NOT NULL
ALTER TABLE dbo.vuRECIPECATEGORY DROP CONSTRAINT vuFK_RecipeCategory_Category
DROP TABLE dbo.vuRECIPECATEGORY
GO

IF OBJECT_ID('dbo.vuRECIPEINGREDIENT', 'U') IS NOT NULL
ALTER TABLE dbo.vuRECIPEINGREDIENT DROP CONSTRAINT vuFK_RecipeIngredient_Ingredient
IF OBJECT_ID('dbo.vuRECIPEINGREDIENT', 'U') IS NOT NULL
ALTER TABLE dbo.vuRECIPEINGREDIENT DROP CONSTRAINT vuFK_RecipeIngredient_Recipe
IF OBJECT_ID('dbo.vuRECIPEINGREDIENT', 'U') IS NOT NULL
ALTER TABLE dbo.vuRECIPEINGREDIENT DROP CONSTRAINT vuFK_RecipeIngredient_Measurement
IF OBJECT_ID('dbo.vuRECIPEINGREDIENT', 'U') IS NOT NULL
DROP TABLE dbo.vuRECIPEINGREDIENT
GO

IF OBJECT_ID('dbo.vuUSER', 'U') IS NOT NULL
DROP TABLE dbo.vuUSER
GO

IF OBJECT_ID('dbo.vuCATEGORY', 'U') IS NOT NULL
DROP TABLE dbo.vuCATEGORY
GO

IF OBJECT_ID('dbo.vuINGREDIENT', 'U') IS NOT NULL
DROP TABLE dbo.vuINGREDIENT
GO

IF OBJECT_ID('dbo.vuMEASUREMENT', 'U') IS NOT NULL
DROP TABLE dbo.vuMEASUREMENT
GO

-- CREATE TABLES

CREATE TABLE dbo.vuUSER 
(
    userID INT NOT NULL IDENTITY PRIMARY KEY,
    userName NVARCHAR(255) NOT NULL,
    userPassword NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE dbo.vuRECIPE
(
    recipeID INT NOT NULL IDENTITY PRIMARY KEY,
    recipeName NVARCHAR(255) NOT NULL,
    recipePrepTime INT NOT NULL,
    recipeCookTime INT NOT NULL,
    recipePicture NVARCHAR(255) NOT NULL,
    FK_userID INT NOT NULL,

    CONSTRAINT vuFK_Recipe_User FOREIGN KEY (FK_userID) REFERENCES dbo.vuUSER (userID)
);
GO

CREATE TABLE dbo.vuPREPARATION 
(
    prepStep NVARCHAR(max) NOT NULL,
    prepStepNumber INT NOT NULL,
    FK_recipeID INT NOT NULL,

    CONSTRAINT vuFK_Preparation_Recipe FOREIGN KEY (FK_recipeID) REFERENCES dbo.vuRECIPE (recipeID)
);
GO

CREATE TABLE dbo.vuCATEGORY
(
    categoryID INT NOT NULL IDENTITY PRIMARY KEY,
    categoryName NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE dbo.vuRECIPECATEGORY
(
    FK_recipeID INT NOT NULL,
    FK_categoryID INT NOT NULL,

    CONSTRAINT vuFK_RecipeCategory_Recipe FOREIGN KEY (FK_recipeID) REFERENCES dbo.vuRECIPE (recipeID),
    CONSTRAINT vuFK_RecipeCategory_Category FOREIGN KEY (FK_categoryID) REFERENCES dbo.vuCATEGORY (categoryID)
);
GO

CREATE TABLE dbo.vuINGREDIENT 
(
    ingredientID INT NOT NULL IDENTITY PRIMARY KEY,
    ingredientName NVARCHAR(255) NOT NULL 
);
GO

CREATE TABLE dbo.vuMEASUREMENT 
(
    measurementID INT NOT NULL IDENTITY PRIMARY KEY,
    measurementName NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE dbo.vuRECIPEINGREDIENT
(
    riAmount DECIMAL(9,2) NOT NULL,
    FK_ingredientID INT NOT NULL,
    FK_recipeID INT NOT NULL,
    FK_measurementID INT NOT NULL,

    CONSTRAINT vuFK_RecipeIngredient_Ingredient FOREIGN KEY (FK_ingredientID) REFERENCES dbo.vuINGREDIENT (ingredientID),
    CONSTRAINT vuFK_RecipeIngredient_Recipe FOREIGN KEY (FK_recipeID) REFERENCES dbo.vuRECIPE (recipeID),
    CONSTRAINT vuFK_RecipeIngredient_Measurement FOREIGN KEY (FK_measurementID) REFERENCES dbo.vuMEASUREMENT (measurementID)
);
GO

-- INSERT

INSERT INTO dbo.vuUSER 
    (userName, userPassword)
VALUES
    ('testuser', '$2a$10$AYgiDFE5nL.FexfrKGd5feN7/06YmO9PP0shUCCyWidCiVkvNWNrS'),
    ('Lisa', '$2a$10$hPHtbZWJQTm4gV8mF43lduPeoertN7baMzlZqY6/0IFh0q2Vx1ZaW'),
    ('Therese', '$2a$10$zgzLl7zROp60ziKydcdI1uW3oPH/48am9cFr9uylktZncnroC6KVK'),
    ('Sofie', '$2a$10$byQ7Hq2vq3Dzv.Oql7Nr9u3vejTyY2jMuNi5pT/ERUOLi3SuwLA8O')
GO

INSERT INTO dbo.vuRECIPE
    (recipeName, recipePicture, recipePrepTime, recipeCookTime, FK_userID)
VALUES
    ('Banan-peanutbutter smoothie', 'http://veganskforbegyndere.dk/wp-content/uploads/2017/08/peanutbutter-smoothie-300x300.jpg', 10, 0, 2),
    ('Bananpandekager med frugt og ahornsirup', 'http://veganskforbegyndere.dk/wp-content/uploads/2017/08/pandekager-camilla-225x300.jpg', 10, 10, 2),
    ('Pestosnurrer', 'https://miasommer.files.wordpress.com/2017/08/img_6497.jpg?w=768', 75, 15, 2),
    ('Salat med hokkaido og grønkål', 'https://miasommer.files.wordpress.com/2016/09/img_0960.jpg?w=768', 15, 30, 3),
    ('Vegansk kylling i karry', 'https://miasommer.files.wordpress.com/2019/01/img_2075.jpg?w=768', 20, 20, 3),
    ('Kartoffel-porresuppe', 'https://miasommer.files.wordpress.com/2014/10/img_5465.jpg?w=768', 20, 15, 4),
    ('Dahl', 'https://miasommer.files.wordpress.com/2011/09/img_4721-resized.jpg?w=768&h=512', 10, 25, 4),
    ('Koldskål', 'https://miasommer.files.wordpress.com/2017/05/img_2768.jpg?w=768', 10, 0, 3),
    ('Æblegalette', 'https://miasommer.files.wordpress.com/2017/10/img_7052.jpg?w=768', 30, 35, 4),
    ('Hummus', 'https://miasommer.files.wordpress.com/2011/08/img_8857-crop.jpg?w=768', 0, 10, 2),
    ('Müslibar', 'https://marialottes.dk/wp-content/uploads/2017/05/m%C3%BCslibar-opskrift.jpg', 5, 15, 3),
    ('Dadelkugler', 'https://www.valdemarsro.dk/wp-content/2008/03/dadelkugler-opskrift.jpg', 15, 0, 4)
GO

INSERT INTO dbo.vuPREPARATION
    (FK_recipeID, prepStepNumber, prepStep)
VALUES
    (1, 1, 'Blend alle ingredienser sammen i en blender, til det har en cremet konsistens.'),

    (2, 1, 'Blend alle ingredienserne i en blender til dejen er ensartet.'),
    (2, 2, 'Steg pandekagerne i på en varm pande med lidt vegansk smør.'),

    (3, 1, 'Opløs gæren i vandet. Tilsæt salt, sukker og grahamsmel. Rør hvedemelet i lidt efter lidt. Ælt dejen godt, og sæt den til hævning tildækket et lunt sted i cirka 45 minutter.'),
    (3, 2, 'Imens dejen hæver, laves pestoen: Skyl spinat og persille og lad bladene dryppe af eller tør dem med et viskestykke. Blend alle ingredienserne i en foodprocesser, til det er så finthakket en masse som muligt (tilsæt evt. en lille smule vand eller olie, hvis pestoen er for tør).'),
    (3, 3, 'Når dejen er færdig med at hæve, skal den deles i to lige store klumper. Ælt først den ene klump og rul den ud på køkkenbordet. Sørg for at drysse køkkenbordet med mel, så dejen ikke hænger fast. Rul dejen ud som en aflang firkant (cirka 20 x 60 cm) og fordel halvdelen af pestoen jævnt på dejen. Fold dernæst halvdelen af firkanten ind over den anden halvdel.'),
    (3, 4, 'Den foldede dej skal nu skæres i strimler af cirka 3 centimeters tykkelse. Hver strimmel skal skæres igennem (undtagen en centimeter for oven), og strimlerne skal snurres omkring hinanden og til sidst formes som en snegl.'),
    (3, 5, 'Hele processen skal gentages med den anden dejklump, så du til sidst har cirka 20 pestosnurrer. De skal efterhæve i 10-15 minutter, imens ovnen varmer op til 200 grader. Derefter bages de i cirka 15 minutter på en bageplade beklædt med bagepapir (hold øje med dem i slutningen af bagetiden).'),
    (3, 6, 'Server eksempelvis pestosnurrerne sammen med suppe eller tag dem med på madpakken. De kan også fryses og tages op efter behov.'),
    
    (4, 1, 'Start med at koge perlebyggen efter anvisningen på pakken.'),
    (4, 2, 'Skær derefter græskaret ud i tern. Det skal ikke skrælles, da man sagtens kan spise skrællen. Læg stykkerne på en bageplade beklædt med bagepapir. Drys lidt salt på og bag græskarstykkerne ved 200 grader i cirka 20 minutter. Græskarstykkerne er færdige, når de er bløde.'),
    (4, 3, 'Imens græskaret bages, tilberedes grønkålen. Fjern stænglerne fra grønkålen og skyl den grundigt. Jeg plejer at lægge grønkålen i blød i en skål med koldt vand i to minutters tid og derefter skylle den i en si. Så fjernes eventuelle kålorme og jordrester effektivt. Hak derefter grønkålen fint.'),
    (4, 4, 'Steg grønkålen på en pande i citronsaft, sojasovs og hvidløg. Steg kun grønkålen et par minutter, indtil den er faldet sammen.'),
    (4, 5, 'Til sidst blandes perlebyg, græskar og grønkål. Salaten spises varm eller kold eventuelt med et stykke brød til og med lidt ekstra salt. Salaten kan også anrettes med avocadostykker og cherrytomater.'),

    (5, 1, 'Hak løg og hvidløg. Steg det i en gryde sammen med karry, chili og olie i nogle minutter.'),
    (5, 2, 'Skræl kartoffel, gulerod, knoldselleri og æble og skær dem i mindre stykker. Hæld det hele ned i gryden sammen med løg og hvidløg og kog det i 2 dl vand sammen med bouillon i cirka 10 minutter. Blend derefter vandet og grøntsagerne med en stavblender, til der ikke er nogen klumper.'),
    (5, 3, 'Tilsæt derefter sojafløde/havrefløde/kokosmælk samt citronsaft. Smag til med salt og peber.'),
    (5, 4, 'Servér evt. retten med dampet broccoli, æblestykker, sorte sesamfrø og korianderblade.'),

    (6, 1, 'Skær kartoflerne ud i mindre stykker. Hak porrerne (også den grønne del). Hak dilden. Lad alle ingredienserne koge i en stor gryde i 15 minutter, eller til kartoflerne er møre.'),
    (6, 2, 'Blend suppen med en stavblender og tilsæt plantefløden. Smag til med salt og peber.'),
    (6, 3, 'Servér eksempelvis suppen med kogte grønne linser, soltørrede tomater og brød.'),

    (7, 1, 'Svits krydderier, løg og hvidløg i en gryde i et par minutter. Brug lidt vand eller olie, så det ikke brænder på.'),
    (7, 2, 'Skyl linserne og put dem i gryden sammen med salt, sukker, tomatpure og vand. '),
    (7, 3, 'Lad retten koge i 25 minutter under låg. Smag til med salt og chili.'),
    (7, 4, 'Spises sammen med ris og evt. mangochutney, ananasstykker, friskhakket koriander, peanuts og brød.'),

    (8, 1, 'Pisk alle ingredienserne sammen og stil koldskålen på køl.'),
    (8, 2, 'Server koldskålen sammen med kammerjunkere og evt. friske jordbær.'),
    
    (9, 1, 'Lav først dejen: Bland hvedemel, grahamsmel og sukker. Tilsæt derefter plantemargarine og vand. Bland dejen godt og brug gerne hænderne. Sæt dejen i køleskabet, imens du laver fyldet.'),
    (9, 2, 'Blend mandler, sukker og vand i en foodprocessor eller minihakker. Blend det, indtil det har en ensartet konsistens.'),
    (9, 3, 'Skær æblerne ud i tynde skiver. Det er ikke nødvendigt at skrælle dem først.'),
    (9, 4, 'Klip et stykke bagepapir, så det har samme størrelse som en bageplade. Rul dejen tyndt ud på bagepapiret, så det danner en cirkel. Smør mandelfyldet på dejen. Læg derefter æbleskiverne ovenpå 2-3 cm fra kanten. Begynd med at lægge den yderste cirkel af æblerne og fortsæt indad. Se billedet nedenfor.'),
    (9, 5, 'Fold derefter kanten af dejen ind over æblerne og drys med kanelsukker. Træk bagepapiret med galetten hen på bagepladen og bag den cirka 35 minutter ved 200 grader almindelig ovn'),
    (9, 6, 'Serveres evt. med sojaflødeskum eller anden vegetabilsk flødeskum.'),
    
    (10, 1, 'Hvis du bruger tørrede kikærter, så læg kikærterne i blød i 8-12 timer. Kog derefter kikærterne 30-40 minutter i nyt vand.'),
    (10, 2, 'Lad kikærterne køle af, og blend derefter alle ingredienserne til en ensartet og cremet masse. Smag til med salt, citronsaft og evt. chili. Tilsæt mere eller mindre vand, alt efter hvilken konsistens hummusen skal have.'),
    
    (11, 1, 'Opvarm ovnen til 130 grader.'),
    (11, 2, 'Når du har vejet de forskellige ingredienser af, som du ønsker i dine müslibarer, blander du de dine tørre ingredienser sammen først '),
    (11, 3, 'Varm hurtigt din sirup op og hæld den henover de tørre ingredienser og rører godt sammen, så det bliver fordelt godt.'),
    (11, 4, 'Masser din masse ned i en lille form (vi brugte små engangs aluminiumbakker), men en silikoneform eller lign. beklædt med bagepapir vil fungere fint.'),
    (11, 5, 'Barerne bages i ca. 15 minutter, men hold øje. De skal gerne blive lettere gyldne på overfladen'),
    (11, 6, 'Lad barerne afkøle og skær dem i ønsket størrelser. '),
    
    (12, 1, 'Kom alle ingredienserne i en foodprocessor og kør til det er en glat masse.'),
    (12, 2, 'Hvis der bruges en minihakker, en bamixblender eller lign, så start med mandler, krydderier og kakao. Blend det godt sammen og tilsæt til sidst resten af ingredienserne.'),
    (12, 3, 'Form til små mundrette kugler.'),
    (12, 4, 'Tril dem i lidt kokosmel, ren kakaopulver, eller spis dem som de er.'),
    (12, 5, 'De smager rigtig godt lige når de er lavet, men bliver kun bedre af at stå i køleskabet i minimum en times tid.')
GO

INSERT INTO dbo.vuCATEGORY 
    (categoryName)
VALUES
    ('morgenmad'),
    ('frokost'),
    ('aftensmad'),
    ('dessert'),
    ('snacks'),
    ('glutenfri'),
    ('nøddefri'),
    ('sukkerfri'),
    ('sund'),
    ('hurtig')
GO

INSERT INTO dbo.vuRECIPECATEGORY
    (FK_recipeID, FK_categoryID)
VALUES
    (1, 1), (1, 6), (1, 10),
    (2, 1), (2, 4), (2, 5), (2, 7),
    (3, 2), (3, 5), (3, 9), 
    (4, 2), (4, 3), (4, 7), (4, 8), (4, 9),
    (5, 3), (5, 6), (5, 7), (5, 8),
    (6, 3), (6, 6), (6, 7), (6, 8),
    (7, 3), (7, 6), (7, 7), (7, 9),
    (8, 2), (8, 4), (8, 10),
    (9, 4),
    (10, 5), (10, 8), (10, 10),
    (11, 5), (11, 6), (11, 10),
    (12, 5), (12, 6), (12, 8), (12, 9), (12, 10)
GO

INSERT INTO dbo.vuINGREDIENT
    (ingredientName)
VALUES
    ('Banan'),
    ('Mel'),
    ('Plantedrik'),
    ('Sukker'),
    ('Vaniljepulver'),
    ('Bagepulver'),
    ('Chiafrø'),
    ('Salt'),
    ('Peanutbutter'),
    ('Sojakakaodrik'),
    ('Kakaopulver'),
    ('Isterninger'),
    ('Ahornsirup'),
    ('Perlebyg'),
    ('Hokkaidogræskar'),
    ('Grønkål'),
    ('Citronsaft'),
    ('Sojasovs'),
    ('Hvidløg'),
    ('Spinat'),
    ('Gær'),
    ('Lunkent vand'),
    ('Grahamsmel'),
    ('Hvedemel'),
    ('Persille'),
    ('Usaltede cashewnødder'),
    ('Løg'),
    ('Karry'),
    ('Chilipulver'),
    ('Olie'),
    ('Kartoffel'),
    ('Gulerod'),
    ('Knoldselleri'),
    ('Æble'),
    ('Grønsagsbullion'),
    ('Vegetabilsk fløde'),
    ('Peber'),
    ('Porrer'),
    ('Dild'),
    ('Koriander'),
    ('Spidskommen'),
    ('Gurkemeje'),
    ('Røde linser'),
    ('Grønne linser'),
    ('Tomatpure'),
    ('Kanelsukker'),
    ('Plantemargarine'),
    ('Mandler'),
    ('Soyayoghurt'),
    ('Soyadrik med vaniljesmag'),
    ('Kikærter'),
    ('Tahin'),
    ('Solsikkekerner'),
    ('Peanuts'),
    ('Rosiner'),
    ('Glutenfri havregryn'),
    ('Glukosesirup'),
    ('Dadler'),
    ('Kokosmel'),
    ('Kokosolie'),
    ('Vegansk smør'),
    ('Kanel'),
    ('Vand')
GO

INSERT INTO dbo.vuMEASUREMENT
    (measurementName)
VALUES
    ('gram'),
    ('kg'),
    ('ml'),
    ('dl'),
    ('cl'),
    ('liter'),
    ('tsk'),
    ('spsk'),
    ('håndfuld'),
    ('bundt'),
    ('stk'),
    ('knivspids'),
    ('fed')
GO

INSERT INTO dbo.vuRECIPEINGREDIENT 
    (FK_recipeID, FK_ingredientID, riAmount, FK_measurementID)
VALUES
    (1, 1, 2.0, 11),
    (1, 9, 1.0, 8),
    (1, 10, 2.0, 4),
    (1, 11, 1.0, 8),
    (1, 12, 2.0, 9),
    (1, 13, 1.0, 8),
    
    (2, 1, 1.0, 11),
    (2, 2, 3.0, 4),
    (2, 3, 4.0, 4),
    (2, 4, 2.0, 8),
    (2, 5, 1.0, 7),
    (2, 6, 1.0, 7),
    (2, 7, 1.0, 8),
    (2, 61, 1.0, 12),

    (3, 21, 50.0, 1),
    (3, 22, 5.0, 4),
    (3, 8, 2.0, 7),
    (3, 4, 2.0, 7),
    (3, 23, 200.0, 1),
    (3, 24, 600.0, 1),
    (3, 20, 100.0, 1),
    (3, 25, 1.0, 10),
    (3, 26, 80.0, 1),
    (3, 19, 2.0, 13),
    (3, 17, 2.0, 8),
    (3, 8, 1.0, 7),
    
    (4, 14, 150.0, 1),
    (4, 15, 1.0, 11),
    (4, 16, 300.0, 1),
    (4, 17, 2.0, 8),
    (4, 18, 1.5, 4),
    (4, 19, 2.0, 13),

    (5, 27, 1.0, 11),
    (5, 19, 1.0, 13),
    (5, 28, 2.0, 7),
    (5, 29, 0.5, 5),
    (5, 30, 2.0, 8),
    (5, 31, 1.0, 11),
    (5, 32, 1.0, 11),
    (5, 33, 75.0, 1),
    (5, 34, 1.0, 11),
    (5, 63, 2.0, 4),
    (5, 35, 1.0, 11),
    (5, 36, 250.0, 3),
    (5, 17, 1.0, 8),

    (6, 31, 1.5, 2),
    (6, 38, 3.0, 11),
    (6, 39, 1.0, 10),
    (6, 35, 2.0, 11),
    (6, 8, 1.0, 7),
    (6, 37, 1.0, 7),
    (6, 63, 1.5, 6),
    (6, 36, 2.5, 4),
    
    (7, 40, 2.0, 7),
    (7, 41, 2.0, 7),
    (7, 42, 2.0, 7),
    (7, 29, 1.0, 7),
    (7, 27, 1.0, 11),
    (7, 19, 4.0, 13),
    (7, 43, 250.0, 1),
    (7, 44, 150.0, 1),
    (7, 8, 2.0, 7),
    (7, 4, 1.0, 7),
    (7, 45, 70.0, 1),
    (7, 63, 1.0, 6),

    (8, 49, 750.0, 3),
    (8, 50, 2.0, 4),
    (8, 17, 0.5, 4),
    (8, 4, 3.0, 8),
    (8, 5, 4.0, 7),

    (9, 24, 200.0, 1),
    (9, 23, 100.0, 1),
    (9, 4, 50.0, 1),
    (9, 47, 100.0, 1),
    (9, 63, 0.75, 4),
    (9, 48, 150.0, 1),
    (9, 4, 150.0, 1),
    (9, 63, 1.0, 4),
    (9, 34, 3.0, 11),
    (9, 46, 1.0, 7),

    (10, 51, 400.0, 1),
    (10, 63, 1.5, 4),
    (10, 17, 0.5, 4),
    (10, 52, 1.0, 8),
    (10, 19, 3.0, 13),
    (10, 41, 1.0, 7),
    (10, 8, 1.0, 7),

    (11, 48, 40.0, 1),
    (11, 55, 40.0, 1),
    (11, 56, 20.0, 1),
    (11, 57, 40.0, 1),

    (12, 58, 150.0, 1),
    (12, 60, 1.0, 8),
    (12, 59, 3.0, 8),
    (12, 48, 30.0, 1),
    (12, 5, 0.5, 7),
    (12, 11, 3.0, 8),
    (12, 62, 1.0, 7)
GO

-- SHOW TABLES
SELECT * FROM dbo.vuUSER
SELECT * FROM dbo.vuRECIPE
SELECT * FROM dbo.vuPREPARATION
SELECT * FROM dbo.vuCATEGORY
SELECT * FROM dbo.vuRECIPECATEGORY
SELECT * FROM dbo.vuINGREDIENT
SELECT * FROM dbo.vuMEASUREMENT
SELECT * FROM dbo.vuRECIPEINGREDIENT
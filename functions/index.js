const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.saveOutfitImage = functions
    .runWith({
        timeoutSeconds: 300,
        memory: '1GB'
    })
    .https.onRequest((req, res) => {
        return cors(req, res, async () => {
            try {
                // Get the ID token from Authorization header
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }

                const idToken = authHeader.split('Bearer ')[1];
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                const uid = decodedToken.uid;

                const { imageUrl } = req.body;
                console.log('Starting image save with URL:', imageUrl);
                
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status}`);
                }
                
                const buffer = await response.buffer();
                const fileName = `outfits/${uid}/${Date.now()}.png`;
                const bucket = admin.storage().bucket();
                const file = bucket.file(fileName);
                
                await file.save(buffer, {
                    metadata: {
                        contentType: 'image/png',
                    }
                });
                
                const [signedUrl] = await file.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500'
                });
                
                console.log('Successfully saved image:', signedUrl);
                res.json({ imageUrl: signedUrl });
                
            } catch (error) {
                console.error('Function error:', error);
                res.status(500).json({ error: error.message });
            }
        });
    });
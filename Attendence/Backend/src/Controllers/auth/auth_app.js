const { get_database } = require("../../config/db_utils");
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { decryptData } = require("../../config/encrpyt"); 

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;

async function getGoogleUserInfo(accessToken) {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );  
        return response.data; 
    } catch (error) {
        throw new Error('Failed to fetch user info from Google API');
    }
}

exports.get_auth = async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: "Access token is required." });
    }

    try {
      
        const decryptedAccessToken = decryptData(accessToken);
        
        if (!decryptedAccessToken) {
            return res.status(400).json({ error: "Failed to decrypt access token." });
        }

        let userInfo;
        try {
      
            userInfo = await getGoogleUserInfo(decryptedAccessToken); 
        } catch (error) {
            return res.status(400).json({ error: "Invalid Google access token." });
        }

        const email = userInfo.email;

        const mentorQuery = "SELECT id, name, gmail, role_id FROM mentor WHERE gmail = ?";
        let results = await get_database(mentorQuery, [email]);

        if (results.length > 0) {
            const mentor = results[0];
            const token = jwt.sign({
                id: mentor.id,
                name: mentor.name,
                gmail: mentor.gmail,
                role_id: mentor.role_id
            }, JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({
                token,
                user: {
                    id: mentor.id,
                    name: mentor.name,
                    gmail: mentor.gmail,
                    role_id: mentor.role_id
                }
            });
        }

        const studentQuery = "SELECT id, name, gmail, register_number, role_id FROM students WHERE gmail = ?";
        results = await get_database(studentQuery, [email]);

        if (results.length > 0) {
            const student = results[0];
            const token = jwt.sign({
                id: student.id,
                name: student.name,
                gmail: student.gmail,
                role_id: student.role_id,
                register_number: student.register_number
            }, JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({
                token,
                user: {
                    id: student.id,
                    name: student.name,
                    gmail: student.gmail,
                    role_id: student.role_id,
                    register_number: student.register_number
                }
            });
        }

        return res.status(404).json({ error: "Email not found." });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

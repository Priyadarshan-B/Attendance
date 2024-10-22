const express = require("express")

const resources = require('../../Controllers/auth/resource')
const router = express.Router();

router.get("/resources", resources.get_resource)
router.get('/rolecheck', resources.validateRole)
router.post('/role-change', resources.updateRole)
router.get('/roles',resources.getAllRoles)

module.exports = router;
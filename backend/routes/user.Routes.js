const userControllers = require("../controllers/userControllers");
const authControllers = require("../controllers/authControllers.js");

const { Router } = require("express");
const router = Router();

router.route("/").get(/* authControllers.restrictByRole("agent"), */ userControllers.getUsers);
router.route("/register").post(authControllers.registerUser);
router.route("/login").post(authControllers.login);
router.route("/logout").post(authControllers.logout);

router.route("/get-managed-properties")
    .get(authControllers.protect, authControllers.restrictByRole("agent"), userControllers.getManagedProperties);
router.route("/get-saved-properties")
    .get(authControllers.protect, authControllers.restrictByRole("buyer"), userControllers.getSavedProperties);

router.route("/:id")
    .get(/* authControllers.restrictByRole("agent"), */ userControllers.getUserById)
    .patch(authControllers.protect, authControllers.restrictByRole("agent"), authControllers.updateUser)
    .delete(authControllers.protect, authControllers.restrictByRole("agent"), authControllers.deleteUser);

//  FIX WHEN NEEDED------------>>>>>>
// router.post('/forgotPassword', authControllers.forgotPassword)
// router.post('/resetPassword/:plainResetToken', authControllers.resetPassword)
// router    

module.exports = router;
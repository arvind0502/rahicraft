import express from "express";
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from "../controller/categoryController.js";
import { recivedQueryController, usersController } from "../controller/authController.js";

const router = express.Router()

//routes 

// create category
router.post('/create-category',requireSignIn,isAdmin, createCategoryController);

// update category
router.put('/update-category/:id', requireSignIn,isAdmin, updateCategoryController)

//getall category
router.get('/get-category',categoryController)


router.get('/queries',requireSignIn,isAdmin,recivedQueryController)
router.get('/users',requireSignIn,isAdmin,usersController)
//single category
router.get('/single-category/:slug',singleCategoryController)

//delete category
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteCategoryController)

export default router;
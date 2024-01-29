import slugify from "slugify";
import productModel from "../models/productModel.js";
import fs from 'fs'
import { log } from "console";
import categoryModel from "../models/categoryModel.js";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from 'dotenv'

dotenv.config()
// Payment Gateway
// var gateway = new braintree.BraintreeGateway({
//   environment: braintree.Environment.Sandbox,
//   merchantId: process.env.BRAINTREE_MERCHANT_ID,
//   publicKey: process.env.BRAINTREE_PUBLIC_KEY,
//   privateKey: process.env.BRAINTREE_PRIVATE_KEY,
// });

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "826hhgdxn8j9cvyn",
  publicKey: "dw4qznzb6nd8r73r",
  privateKey: "e72fc2b23599118f1a43ee918d83a602",
});

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, age, material, shipping } = req.fields;
    const { photo } = req.files;
    //Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !age:
        return res.status(500).send({ error: "Age is Required" });
      case !material:
        return res.status(500).send({ error: "Material is Required" });
      // case !shipping:
      //     return res.status(500).send({ error: "Shipping is Required" });
      case photo:
        return res
          .status(500)
          .send({ error: "Photo is required and should be less than 1 mb" });
    }


    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Product"
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel.find({}).populate('category').select("-photo").limit(12).sort({ createdAt: -1 })
    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "All Products",
      products,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message
    })
  }
};

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel.find({ slug: req.params.slug }).select('-photo').populate('category')
    res.status(200).send({
      success: true,
      message: "Single Product fetched",
      product,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting product",
      error
    })
  }
};

//get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select('photo')
    if (product.photo.data) {
      res.set('Content-type', product.photo.contentType)
      return res.status(200).send(product.photo.data)
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while geting photo",
      error
    })
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo")
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully"

    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting Product",
      error
    })
  }
};

// update productcontroller

export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, age, material, shipping } = req.fields
    const { photo } = req.files
    //Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !age:
        return res.status(500).send({ error: "Age is Required" });
      case !material:
        return res.status(500).send({ error: "Material is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quanity is Required" })
      // case !shipping:
      //     return res.status(500).send({ error: "Shipping is Required" });
      case photo:
        return res.status(500).send({ error: "Photo is required and should be less than 1 mb" });
    }

    const products = await productModel.findByIdAndUpdate(req.params.pid,
      { ...req.fields, slug: slugify(name) })
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path)
      products.photo.contentType = photo.type
    }
    await products.save()
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updating Product"
    })
  }
};

// filters

export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Errore while filtering products",
      error
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 4;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};


// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(12)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get product list by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// Payment Gateway Api
// token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, respones) {
      if (err) {
        res.status(500).send(err)
      } else {
        res.send(respones)
      }
    })
  } catch (error) {
    console.log(error);
  }
}

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body
    let total = 0;
    cart.map(i => { total += i.price });
    let newTransection =gateway.transaction.sale({
      amount:total,
      paymentMethodNonce:nonce,
      options:{
        submitForSettlement:true
      }
    },
    function(error,result){
      if (result) {
        const order=new orderModel({
          products:cart,
          payment:result,
          buyer:req.user._id
        }).save()
        res.json({ok:true})
      }else{
        res.status(500).send(error)
      }
    }
  
    )
  } catch (error) {
    console.log(error);
  }
}
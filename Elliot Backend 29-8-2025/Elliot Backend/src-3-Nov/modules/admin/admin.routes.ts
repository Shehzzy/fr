import express from 'express';
import adminController from './admin.controller';
import authenticator from '../../middlewares/authenticator';
import CouponWriting from '../../models/CouponWriting';

const router = express.Router();

// router.use(fileUpload());

// Profile apis
router.post('/login', adminController.login);
router.get('/view-profile', authenticator, adminController.viewProfile);
router.post('/edit-profile', authenticator, adminController.updateProfile);
router.put('/forgot-password', adminController.forgetPassword);
router.post('/validate-reset-link', adminController.validateResetLink);
router.post('/set-new-password', adminController.setNewPassword);
router.post('/change-password', authenticator, adminController.changePassword);
router.get('/users/count', authenticator, adminController.countUsers);
router.get('/get-all-users', authenticator, adminController.getAllUsers);

// User Management
// router.post("/create-user", authenticator, adminController.createUser)
// router.post("/edit-user", authenticator, adminController.editUser)
router.get('/get-user', authenticator, adminController.getUser);
router.delete('/delete-user/:id', authenticator, adminController.deleteUser);

//===============Dynamically changes on User side====================
// router.post("/home", authenticator, adminController.createHome);
router.post('/update-home', authenticator, adminController.updateHome);
router.get('/get-home', adminController.getHome);

//===================BLOG MANAGEMENT=================
// Create a new blog
router.post('/create-blog', authenticator, adminController.createBlog);

// Update an existing blog
router.put('/update-blog', authenticator, adminController.updateBlog);

// Get all blogs (list)
router.get('/get-blog', adminController.getBlog);

// Get a single blog by slug (instead of ID)
router.get('/get-blog/:slug', adminController.getBlogBySlug);

// Delete a blog (optional: by ID or slug)
router.post('/delete-blog', authenticator, adminController.deleteBlog);

//================================Privacy policy==========================
router.post('/update/privacy-policy', authenticator, adminController.updatePrivacyPolicy);
router.get('/privacy-policy', adminController.getPrivacyPolicy);

//=============================Page Meta Tags=============================
router.get('/admin/page-meta', adminController.getAllMeta); // Admin listing
router.get('/meta/:page', adminController.getMetaByPage); // Frontend fetch
router.post('/admin/page-meta', adminController.createMeta); // Create (once)
router.put('/admin/page-meta/:page', adminController.updateMeta); // Update

//===========================File Upload raning===============
router.post('/upload-csv', authenticator, adminController.uploadFiles);
router.get('/rankings/:positionType/:scoringType', adminController.getRankings);

router.get('/fetch-coupons', authenticator, adminController.listPromoCodes);
router.post('/create-coupon', authenticator, adminController.createPromoCode);
router.post('/delete-coupon', authenticator, adminController.deleteCoupon);
router.post('/create-coupon-writing', authenticator, async (req: any, res: any) => {
  try {
    const { title, description, isActive } = req.body;
    if (!title || !description) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Title and description are required',
      });
    }
    if (description.length < 10) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Description must be at least 10 characters long',
      });
    }
    const newCouponWriting = new CouponWriting({
      title: title.trim(),
      description: description.trim(),
      isActive: isActive !== undefined ? isActive : true,
    });
    const savedCouponWriting = await newCouponWriting.save();
    res.status(200).json({
      code: 200,
      status: true,
      message: 'Coupon writing created successfully',
      data: savedCouponWriting,
    });
  } catch (error) {
    console.error('Error creating coupon writing:', error);
    res.status(500).json({
      code: 500,
      status: false,
      error: 'Internal server error',
    });
  }
});
router.get('/get-coupon-writings', async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const couponWritings = await CouponWriting.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CouponWriting.countDocuments();
    res.status(200).json({
      code: 200,
      status: true,
      message: 'Coupon writings fetched successfully',
      data: couponWritings,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching coupon writings:', error);
    res.status(500).json({
      code: 500,
      status: false,
      error: 'Internal server error',
    });
  }
});
router.get('/get-coupon-writing/:id', authenticator, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Invalid coupon writing ID',
      });
    }

    const couponWriting = await CouponWriting.findById(id);

    if (!couponWriting) {
      return res.status(404).json({
        code: 404,
        status: false,
        error: 'Coupon writing not found',
      });
    }

    res.status(200).json({
      code: 200,
      status: true,
      message: 'Coupon writing fetched successfully',
      data: couponWriting,
    });
  } catch (error) {
    console.error('Error fetching coupon writing:', error);
    res.status(500).json({
      code: 500,
      status: false,
      error: 'Internal server error',
    });
  }
});
router.put('/update-coupon-writing/:id', authenticator, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Invalid coupon writing ID',
      });
    }

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Title and description are required',
      });
    }

    if (description.length < 10) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Description must be at least 10 characters long',
      });
    }

    const updatedCouponWriting = await CouponWriting.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description.trim(),
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedCouponWriting) {
      return res.status(404).json({
        code: 404,
        status: false,
        error: 'Coupon writing not found',
      });
    }

    res.status(200).json({
      code: 200,
      status: true,
      message: 'Coupon writing updated successfully',
      data: updatedCouponWriting,
    });
  } catch (error) {
    console.error('Error updating coupon writing:', error);
    res.status(500).json({
      code: 500,
      status: false,
      error: 'Internal server error',
    });
  }
});
router.delete('/delete-coupon-writing/:id', authenticator, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Invalid coupon writing ID',
      });
    }

    const deletedCouponWriting = await CouponWriting.findByIdAndDelete(id);

    if (!deletedCouponWriting) {
      return res.status(404).json({
        code: 404,
        status: false,
        error: 'Coupon writing not found',
      });
    }

    res.status(200).json({
      code: 200,
      status: true,
      message: 'Coupon writing deleted successfully',
      data: deletedCouponWriting,
    });
  } catch (error) {
    console.error('Error deleting coupon writing:', error);
    res.status(500).json({
      code: 500,
      status: false,
      error: 'Internal server error',
    });
  }
});
router.patch('/toggle-coupon-writing-status/:id', authenticator, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: 400,
        status: false,
        error: 'Invalid coupon writing ID',
      });
    }

    const couponWriting = await CouponWriting.findById(id);

    if (!couponWriting) {
      return res.status(404).json({
        code: 404,
        status: false,
        error: 'Coupon writing not found',
      });
    }

    couponWriting.isActive = !couponWriting.isActive;
    couponWriting.updatedAt = new Date();

    const updatedCouponWriting = await couponWriting.save();

    res.status(200).json({
      code: 200,
      status: true,
      message: `Coupon writing ${updatedCouponWriting.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedCouponWriting,
    });
  } catch (error) {
    console.error('Error toggling coupon writing status:', error);
    res.status(500).json({
      code: 500,
      status: false,
      error: 'Internal server error',
    });
  }
});

export default router;

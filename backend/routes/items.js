const express = require('express');
const router = express.Router();

const Item = require('../models/Item');


// =====================================
// ADD ITEM
// =====================================
router.post('/', async (req, res) => {

    try {

        const {
            type,
            title,
            description,
            category,
            location,
            image,
            contact,
            date,
            status
        } = req.body;

        const item = new Item({
            type,
            title,
            description,
            category,
            location,
            image,
            contact,
            date,
            status: status || 'open',
            createdAt: new Date()
        });

        await item.save();

        res.status(201).json(item);

    } catch (error) {

        res.status(500).json({
            message: 'Server Error',
            error
        });

    }

});


// =====================================
// GET ALL ITEMS
// =====================================
router.get('/', async (req, res) => {

    try {

        const items = await Item.find().sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {

        res.status(500).json({
            message: 'Server Error',
            error
        });

    }

});


// =====================================
// GET SINGLE ITEM
// =====================================
router.get('/:id', async (req, res) => {

    try {

        const item = await Item.findById(req.params.id);

        if (!item) {

            return res.status(404).json({
                message: 'Item not found'
            });

        }

        res.json(item);

    } catch (error) {

        res.status(500).json({
            message: 'Server Error',
            error
        });

    }

});


// =====================================
// UPDATE ITEM STATUS
// =====================================
router.put('/:id', async (req, res) => {

    try {

        const item = await Item.findById(req.params.id);

        if (!item) {

            return res.status(404).json({
                message: 'Item not found'
            });

        }

        item.status = req.body.status;

        await item.save();

        res.json(item);

    } catch (error) {

        res.status(500).json({
            message: 'Server Error',
            error
        });

    }

});


// =====================================
// DELETE ITEM
// =====================================
router.delete('/:id', async (req, res) => {

    try {

        const item = await Item.findById(req.params.id);

        if (!item) {

            return res.status(404).json({
                message: 'Item not found'
            });

        }

        await item.deleteOne();

        res.json({
            message: 'Item deleted'
        });

    } catch (error) {

        res.status(500).json({
            message: 'Server Error',
            error
        });

    }

});


module.exports = router;
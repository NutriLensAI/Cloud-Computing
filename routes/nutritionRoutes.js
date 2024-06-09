const express = require('express');
const fs = require('fs');
const fsPost = require('fs').promises;
const path = require('path');
const authenticateToken = require('../middleware/auth');
const Breakfast = require('../models/breakfastsModel');
const Lunch = require('../models/lunchsModel');
const Dinner = require('../models/dinnersModel');
const { Op } = require('sequelize');
require('dotenv').config();

const router = express.Router();

// Get all nutrition data
router.get('/data', (req, res) => {
    fs.readFile(path.join(__dirname, '../datanutrition.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data');
        } else {
            const parsedData = JSON.parse(data);
            res.json(parsedData.dataNutrition);
        }
    });
});

router.post('/:table/food/:id', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const data = await fsPost.readFile(path.join(__dirname, '../datanutrition.json'), 'utf8');
        const parsedData = JSON.parse(data);
        const item = parsedData.dataNutrition.find(d => d.id === id);

        let model;

        switch (req.params.table) {
            case 'breakfasts':
                model = Breakfast;
                break;

            case 'lunchs':
                model = Lunch;
                break;

            case 'dinners':
                model = Dinner;
                break;
        }

        const Model = await model.create({
            user_id: req.user.id,
            food_id: item.id,
            food_name: item.name,
            calories: item.calories,
            proteins: item.proteins,
            fat: item.fat,
            carbohydrate: item.carbohydrate
        });

        res.status(201).json(Model);
    } catch (error) {
        // Menangani error jika terjadi
        return res.status(500).send(error);
    }
});

router.get('/user/foods', authenticateToken, async (req, res) => {
    try {
        const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000);
        const breakfasts = await Breakfast.findAll({
            where: {
                user_id: req.user.id,
                createdAt: {
                    [Op.gt]: sevenHoursAgo
                }
            }
        });
        const lunchs = await Lunch.findAll({
            where: {
                user_id: req.user.id,
                createdAt: {
                    [Op.gt]: sevenHoursAgo
                }
            }
        });
        const dinners = await Dinner.findAll({
            where: {
                user_id: req.user.id,
                createdAt: {
                    [Op.gt]: sevenHoursAgo
                }
            }
        });
        const BreakfastTotalCarbs = breakfasts.reduce((sum, breakfast) => sum + breakfast.carbohydrate, 0);
        const BreakfastTotalFat = breakfasts.reduce((sum, breakfast) => sum + breakfast.fat, 0);
        const BreakfastTotalProt = breakfasts.reduce((sum, breakfast) => sum + breakfast.proteins, 0);
        const BreakfastTotalCalories = breakfasts.reduce((sum, breakfast) => sum + breakfast.calories, 0);

        const LunchTotalCarbs = lunchs.reduce((sum, lunch) => sum + lunch.carbohydrate, 0);
        const LunchTotalFat = lunchs.reduce((sum, lunch) => sum + lunch.fat, 0);
        const LunchTotalProt = lunchs.reduce((sum, lunch) => sum + lunch.proteins, 0);
        const LunchTotalCalories = lunchs.reduce((sum, lunch) => sum + lunch.calories, 0);

        const DinnerTotalCarbs = dinners.reduce((sum, dinner) => sum + dinner.carbohydrate, 0);
        const DinnerTotalFat = dinners.reduce((sum, dinner) => sum + dinner.fat, 0);
        const DinnerTotalProt = dinners.reduce((sum, dinner) => sum + dinner.proteins, 0);
        const DinnerTotalCalories = dinners.reduce((sum, dinner) => sum + dinner.calories, 0);

        const totalCarbs = BreakfastTotalCarbs + LunchTotalCarbs + DinnerTotalCarbs;
        const totalFat = BreakfastTotalFat + LunchTotalFat + DinnerTotalFat;
        const totalProt = BreakfastTotalProt + LunchTotalProt + DinnerTotalProt;
        const totalCalories = BreakfastTotalCalories + LunchTotalCalories + DinnerTotalCalories;
        const modelMerge = {
            'Breakfast': {
                'data': breakfasts,
                'total': {
                    'Carbs': BreakfastTotalCarbs,
                    'Fat': BreakfastTotalFat,
                    'Prot': BreakfastTotalProt,
                    'Calories': BreakfastTotalCalories
                }
            },
            'Lunch': {
                'data': lunchs,
                'total': {
                    'Carbs': LunchTotalCarbs,
                    'Fat': LunchTotalFat,
                    'Prot': LunchTotalProt,
                    'Calories': LunchTotalCalories
                }
            },
            'Dinner': {
                'data': dinners,
                'total': {
                    'Carbs': DinnerTotalCarbs,
                    'Fat': DinnerTotalFat,
                    'Prot': DinnerTotalProt,
                    'Calories': DinnerTotalCalories
                }
            },
            'Macros': {
                'totalCarbs': totalCarbs,
                'totalFat': totalFat,
                'totalProteins': totalProt,
                'totalCalories': totalCalories
            }
        };
        res.json(modelMerge);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

/**
 * {
 *      'breakfast': {
 *          'data' {
 *              {
            "id": 3,
            "user_id": 21,
            "food_id": 203,
            "calories": 97,
            "proteins": 5.8,
            "fat": 6.3,
            "carbohydrate": 4.2,
            "food_name": "Cap cai sayur"
        },
        {
            "id": 4,
            "user_id": 21,
            "food_id": 504,
            "calories": 289,
            "proteins": 38,
            "fat": 14,
            "carbohydrate": 0,
            "food_name": "Ikan Sepat kering"
        }
 *          },
 *          'total' {
 * }
 *      } 
 *      'lunch': {
 *          ....
 *      } 
 *      'dinner': {
 *          ....
 *      } 
 * }
 * 
 * {
            "id": 3,
            "user_id": 21,
            "food_id": 203,
            "calories": 97,
            "proteins": 5.8,
            "fat": 6.3,
            "carbohydrate": 4.2,
            "food_name": "Cap cai sayur"
        },
        {
            "id": 4,
            "user_id": 21,
            "food_id": 504,
            "calories": 289,
            "proteins": 38,
            "fat": 14,
            "carbohydrate": 0,
            "food_name": "Ikan Sepat kering"
        }
*/
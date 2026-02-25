import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCities, addCity, removeCity, toggleFavorite, searchCity } from '../controllers/cityController.js';

const router = Router();

router.use(authenticate);

router.get('/', getCities);
router.post('/', addCity);
router.delete('/:id', removeCity);
router.patch('/:id/favorite', toggleFavorite);
router.get('/search', searchCity);

export default router;

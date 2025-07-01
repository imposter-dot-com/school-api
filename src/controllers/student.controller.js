import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

export const createStudent = async (req, res) => {
    try {
        const student = await db.Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: Course
 *         description: Include related models
 *     responses:
 *       200:
 *         description: List of students
 */

export const getAllStudents = async (req, res) => {

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort?.toLowerCase() === 'desc' ? 'DESC' : "ASC";
    const populate = req.query.populate?.split(',') || [];

    const include = [];

    if(populate.include('Course') || populate.include('course')){
        include.push(db.Course);
    }

    try {
        const students = await db.Student.findAll({ include, limit, offset: (page - 1) * limit, order: [['createdAt', sort]]});
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: Course
 *         description: Include related models
 */

export const getStudentById = async (req, res) => {
    const populate = req.query.populate?.split(',') || [];
    const include = [];

    if (populate.includes('Course') || populate.includes('course')) {
        include.push(db.Course);
    }

    try {
        const student = await db.Student.findByPk(req.params.id, { include });
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: Course
 *         description: Include related models in updated response
 */

export const updateStudent = async (req, res) => {
    const populate = req.query.populate?.split(',') || [];
    const include = [];

    if (populate.includes('Course') || populate.includes('course')) {
        include.push(db.Course);
    }

    try {
        const student = await db.Student.findByPk(req.params.id, { include });
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.update(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const Genre = require("../models/genre");
const Book = require('../models/book')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator')

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genreList = await Genre.find().sort({name: 1}).exec()
  res.render('genre_list', {
    title: 'Genre List',
    genre_list: genreList
  })
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, allBooksByGenre] =  await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id })
  ])
  if(genre === null){
    res.redirect('/catalog/genres')
  }
  res.render('genre_detail', {
    title: 'Genre Detail',
    genre: genre,
    allBooksByGenre: allBooksByGenre
  })
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' , genre: null, errors: null})
});

// Handle Genre create on POST.
exports.genre_create_post = [
  //validation
  body('name', 'Genre name must contain at least 3 characters')
  .trim()
  .isLength({ min: 3 })
  .escape(),

  // process request after validation
  asyncHandler(async (req, res, next) => {
    console.log(req)
    const errors = validationResult(req)

    const genre = new Genre({ name: req.body.name })

    if(!errors.isEmpty()){
      res.render('genre_form',{
        title: 'Create Genre',
        genre: genre,
        errors: errors.array()      
      })
      return
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
      .collation({ locale: 'en', strength: 2 })
      .exec()

      if(genreExists){
        res.redirect(genreExists.url)
      } else {
        await genre.save()
        res.redirect(genre.url)
      }
    }
  })
]

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, allBooksByGenre] =  await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id })
  ])
  if(genre === null){
    res.redirect('/catalog/genres')
  }

  res.render('genre_delete', {
    title: 'Delete Genre',
    genre: genre,
    allBooksByGenre: allBooksByGenre
  })
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, allBooksByGenre] =  await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id })
  ])
  if(allBooksByGenre.length > 0){
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: genre,
      allBooksByGenre: allBooksByGenre
    })
    return
  } else {
    await Genre.findByIdAndDelete(req.body.genreid)
    res.redirect('/catalog/genres')
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});

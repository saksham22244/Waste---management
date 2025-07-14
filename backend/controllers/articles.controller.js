const Article = require("../models/article");

// Create a new article
exports.createArticle = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Get image URL

    const newArticle = new Article({ title, description, imageUrl, category });
    await newArticle.save();

    res.status(201).json({ message: "Article created successfully", article: newArticle });
  } catch (err) {
    res.status(500).json({ message: "Error creating article", error: err.message });
  }
};

// Get all articles
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ message: "Error fetching articles", error: err.message });
  }
};

// Update an article
exports.updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { title, description, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl; // Get image URL

    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      { title, description, imageUrl, category },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ message: "Article updated successfully", article: updatedArticle });
  } catch (err) {
    res.status(500).json({ message: "Error updating article", error: err.message });
  }
};

// Delete an article
exports.deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting article", error: err.message });
  }
};
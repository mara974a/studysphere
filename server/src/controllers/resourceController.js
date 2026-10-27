import Resource from '../models/Resource.js';

/**
 * @desc    Get all study resources (with optional filters)
 * @route   GET /api/resources
 * @access  Private
 */
export const getResources = async (req, res, next) => {
  try {
    const { search, subject, resourceType, myOnly } = req.query;
    const filter = {};

    if (subject && subject !== 'All') {
      filter.subject = subject;
    }

    if (resourceType && resourceType !== 'All') {
      filter.resourceType = resourceType;
    }

    if (myOnly === 'true') {
      filter.createdBy = req.user.id;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(filter);

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single study resource by ID
 * @route   GET /api/resources/:id
 * @access  Private
 */
export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Study resource not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new study resource
 * @route   POST /api/resources
 * @access  Private
 */
export const createResource = async (req, res, next) => {
  try {
    const { title, subject, resourceType, link, description, difficulty, tags } =
      req.body;

    // Field validation
    if (!title || !subject || !resourceType || !link || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, subject, resourceType, link, description.',
      });
    }

    // Process tags (can come as comma-separated string or array)
    let processedTags = [];
    if (typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } else if (Array.isArray(tags)) {
      processedTags = tags.map((t) => String(t).trim()).filter((t) => t.length > 0);
    }

    const resource = await Resource.create({
      title: title.trim(),
      subject,
      resourceType,
      link: link.trim(),
      description: description.trim(),
      difficulty: difficulty || 'Intermediate',
      tags: processedTags,
      createdBy: req.user.id,
      creatorName: req.user.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Study resource created successfully!',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a study resource
 * @route   PUT /api/resources/:id
 * @access  Private (Owner only)
 */
export const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Study resource not found.',
      });
    }

    // Check ownership
    const isOwner =
      String(resource.createdBy) === String(req.user.id) ||
      req.user.role === 'admin';

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You may only edit resources that you created.',
      });
    }

    const { title, subject, resourceType, link, description, difficulty, tags } =
      req.body;

    let processedTags = resource.tags;
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        processedTags = tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
      } else if (Array.isArray(tags)) {
        processedTags = tags
          .map((t) => String(t).trim())
          .filter((t) => t.length > 0);
      }
    }

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title: title.trim() }),
        ...(subject && { subject }),
        ...(resourceType && { resourceType }),
        ...(link && { link: link.trim() }),
        ...(description && { description: description.trim() }),
        ...(difficulty && { difficulty }),
        ...(tags !== undefined && { tags: processedTags }),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Study resource updated successfully!',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a study resource
 * @route   DELETE /api/resources/:id
 * @access  Private (Owner only)
 */
export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Study resource not found.',
      });
    }

    // Check ownership
    const isOwner =
      String(resource.createdBy) === String(req.user.id) ||
      req.user.role === 'admin';

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You may only delete resources that you created.',
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Study resource deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

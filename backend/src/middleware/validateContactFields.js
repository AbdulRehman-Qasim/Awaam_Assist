const validateContactFields = (req, res, next) => {
  const { firstName, lastName, email, topic, message } = req.body;
  
  const errors = [];

  // Required field validation
  if (!firstName?.trim()) errors.push('First name is required');
  if (!lastName?.trim()) errors.push('Last name is required');
  if (!email?.trim()) errors.push('Email is required');
  if (!topic?.trim()) errors.push('Topic is required');
  if (!message?.trim()) errors.push('Message is required');

  // // Email validation
  // const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  // if (email && !emailRegex.test(email)) {
  //   errors.push('Please enter a valid email address');
  // }

  // Topic validation
  const validTopics = ['general', 'sales', 'support', 'billing', 'partnership'];
  if (topic && !validTopics.includes(topic)) {
    errors.push('Invalid topic selected');
  }

  // Message length validation
  if (message && message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = { validateContactFields };
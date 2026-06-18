/** Send a success response */
export const success = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

/** Send a 201 created response */
export const created = (res, data = null, message = 'Created successfully') => {
  res.status(201).json({ success: true, message, data });
};

/** Send a paginated response */
export const paginated = (res, data, pagination) => {
  res.status(200).json({
    success: true,
    message: 'Success',
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

/** Send a 204 no content response */
export const noContent = (res) => {
  res.status(204).send();
};

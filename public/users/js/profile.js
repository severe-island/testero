$.ajax({
  type: 'GET',
  url: '/users/users/' + app.params.id,
  success: function(data) {
    $('#page-content').loadTemplate(
      '/users/html/profile.html',
      {
        id: data.user.id,
        email: data.user.email || '<em>Пользователь скрыл свой email.</em>'
      },
      {
        append: true
      }
    );
  },
  error: function() {
    showAlert('Ошибка сервера, попробуйте позже.', 'danger');
  }
});

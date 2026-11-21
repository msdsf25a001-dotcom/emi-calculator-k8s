$(function () {
  function loadHistory() {
    $.getJSON('/api/history', function (data) {
      let rows = '';
      data.forEach(d => {
        rows += `<tr>
          <td>${d.principal}</td>
          <td>${d.rate}</td>
          <td>${d.months}</td>
          <td>${d.emi}</td>
          <td><code>${d.servedBy}</code></td>
        </tr>`;
      });
      $('#historyBody').html(rows);
    });
  }

  $('#emiForm').on('submit', function (e) {
    e.preventDefault();
    const payload = {
      principal: +$('#principal').val(),
      rate: +$('#rate').val(),
      months: +$('#months').val()
    };

    if (payload.principal <= 0 || payload.rate <= 0 || payload.months <= 0) {
      alert('All fields must be positive numbers');
      return;
    }

    $.ajax({
      url: '/api/emi',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: function (res) {
        $('#resultCard').show();
        $('#emi').text(res.emi);
        $('#totalPayment').text(res.totalPayment);
        $('#totalInterest').text(res.totalInterest);
        $('#servedBy').text(res.servedBy);
        loadHistory();
      },
      error: function (xhr) {
        alert('Error: ' + xhr.responseText);
      }
    });
  });

  loadHistory();
});

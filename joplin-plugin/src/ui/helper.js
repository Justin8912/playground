document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('myCheckbox');
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        testFunction(true);
      } else {
        testFunction(false);
      }
    });
  }

  function testFunction(isChecked) {
    console.log('Checkbox is now:', isChecked);
    // You can replace this with any logic you want
  }
});

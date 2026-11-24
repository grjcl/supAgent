(function () {
  'use strict';

  var students = [];
  var editingId = null;

  var searchInput = document.getElementById('searchInput');
  var addButton = document.getElementById('btnAdd');
  var tableBody = document.getElementById('studentTableBody');
  var modal = document.getElementById('studentModal');
  var form = document.getElementById('studentForm');
  var cancelButton = document.getElementById('btnCancel');

  var idInput = document.getElementById('studentId');
  var nameInput = document.getElementById('studentName');
  var genderInput = document.getElementById('studentGender');
  var ageInput = document.getElementById('studentAge');
  var majorInput = document.getElementById('studentMajor');
  var emailInput = document.getElementById('studentEmail');

  var idError = document.getElementById('studentIdError');
  var nameError = document.getElementById('studentNameError');
  var genderError = document.getElementById('studentGenderError');
  var ageError = document.getElementById('studentAgeError');
  var majorError = document.getElementById('studentMajorError');
  var emailError = document.getElementById('studentEmailError');

  var errorElements = [
    idError,
    nameError,
    genderError,
    ageError,
    majorError,
    emailError
  ];

  function clearErrors() {
    errorElements.forEach(function (element) {
      element.textContent = '';
    });
  }

  function showError(element, message) {
    element.textContent = message;
  }

  function setFieldValues(student) {
    idInput.value = student.id;
    nameInput.value = student.name;
    genderInput.value = student.gender;
    ageInput.value = String(student.age);
    majorInput.value = student.major;
    emailInput.value = student.email;
  }

  function openModal() {
    modal.hidden = false;
    idInput.focus();
  }

  function closeModal() {
    modal.hidden = true;
    editingId = null;
    clearErrors();
  }

  function openAddModal() {
    editingId = null;
    form.reset();
    clearErrors();
    openModal();
  }

  function openEditModal(id) {
    var student = students.find(function (item) {
      return item.id === id;
    });

    if (!student) {
      return;
    }

    editingId = student.id;
    form.reset();
    setFieldValues(student);
    clearErrors();
    openModal();
  }

  function removeStudent(id) {
    if (!window.confirm('确定删除该学生吗？')) {
      return;
    }

    students = students.filter(function (student) {
      return student.id !== id;
    });
    render();
  }

  function createCell(value) {
    var cell = document.createElement('td');
    cell.textContent = value;
    return cell;
  }

  function createActionButton(label, action, id, className) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = id;
    return button;
  }

  function render() {
    var query = searchInput.value.trim().toLowerCase();
    var fragment = document.createDocumentFragment();

    students
      .filter(function (student) {
        return (
          student.name.toLowerCase().indexOf(query) !== -1 ||
          student.id.toLowerCase().indexOf(query) !== -1
        );
      })
      .forEach(function (student) {
        var row = document.createElement('tr');
        row.dataset.id = student.id;

        row.appendChild(createCell(student.id));
        row.appendChild(createCell(student.name));
        row.appendChild(createCell(student.gender));
        row.appendChild(createCell(String(student.age)));
        row.appendChild(createCell(student.major));
        row.appendChild(createCell(student.email));

        var actions = document.createElement('td');
        actions.appendChild(
          createActionButton('编辑', 'edit', student.id, 'btn btn-edit')
        );
        actions.appendChild(
          createActionButton('删除', 'delete', student.id, 'btn btn-danger')
        );
        row.appendChild(actions);

        fragment.appendChild(row);
      });

    tableBody.textContent = '';
    tableBody.appendChild(fragment);
  }

  function collectValues() {
    return {
      id: idInput.value.trim(),
      name: nameInput.value.trim(),
      gender: genderInput.value,
      age: ageInput.value.trim(),
      major: majorInput.value.trim(),
      email: emailInput.value.trim()
    };
  }

  function validate(values) {
    var isValid = true;

    if (!values.id) {
      showError(idError, '请输入学号');
      isValid = false;
    }

    if (!values.name) {
      showError(nameError, '请输入姓名');
      isValid = false;
    }

    if (!values.age) {
      showError(ageError, '请输入年龄');
      isValid = false;
    } else {
      var age = Number(values.age);
      if (!Number.isInteger(age) || age < 1 || age > 120) {
        showError(ageError, '年龄必须为 1 到 120 之间的整数');
        isValid = false;
      }
    }

    if (!values.major) {
      showError(majorError, '请输入专业');
      isValid = false;
    }

    if (!values.email) {
      showError(emailError, '请输入邮箱');
      isValid = false;
    }

    if (values.id) {
      var duplicate = students.some(function (student) {
        return student.id === values.id && student.id !== editingId;
      });

      if (duplicate) {
        showError(idError, '学号已存在');
        isValid = false;
      }
    }

    return isValid;
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearErrors();

    var values = collectValues();
    if (!validate(values)) {
      return;
    }

    var student = {
      id: values.id,
      name: values.name,
      gender: values.gender,
      age: Number(values.age),
      major: values.major,
      email: values.email
    };

    if (editingId === null) {
      students.push(student);
    } else {
      var index = students.findIndex(function (item) {
        return item.id === editingId;
      });

      if (index !== -1) {
        students[index] = student;
      }
    }

    closeModal();
    render();
  }

  function handleTableClick(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    var button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    if (button.dataset.action === 'edit') {
      openEditModal(button.dataset.id);
    } else if (button.dataset.action === 'delete') {
      removeStudent(button.dataset.id);
    }
  }

  function init() {
    students = window.STUDENT_SEED.map(function (student) {
      return {
        id: student.id,
        name: student.name,
        gender: student.gender,
        age: student.age,
        major: student.major,
        email: student.email
      };
    });

    addButton.addEventListener('click', openAddModal);
    cancelButton.addEventListener('click', closeModal);
    form.addEventListener('submit', handleSubmit);
    searchInput.addEventListener('input', render);
    tableBody.addEventListener('click', handleTableClick);

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

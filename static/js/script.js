var step = 0,
    mq = window.matchMedia('(max-width: 1055px), (max-height: 480px)');

showBio();

if (mq.matches) {
  document.getElementById('buttons').style.display = 'block';
  setTimeout(showButtons, 2200);
} else {
  var clk = setInterval(function() {
    switch(step) {
      case 0:
      showSkills();
      break;
      case 1:
      hideSkills();
      break;
      case 2:
      window.clearInterval(clk);
      break;
    }
    step++;
  }, 10000);
}

function showBio() {
  setTimeout(function() {
    var content = document.getElementsByClassName('content');
    content[0].style.opacity = 1;
    setTimeout(function() {
      var bio = document.getElementById('bio');
      bio.className = 'show';
    }, 1500);
  }, 500);
}

function showSkills() {

  document.getElementById('bio').style.display = 'none';
  document.getElementById('skills').style.display = 'block';

  var skillElems = document.getElementById('skills').children;

  function showSkill(skill) {
    setTimeout(function() {
      skill.className = 'show';
    }, Math.random() * 300);
  }

  for (var i = 0; i < skillElems.length; i++) {
    var skill = skillElems[i];
    showSkill(skill);
  }
}

function hideSkills() {
  var skillElems = document.getElementById('skills').children;

  function hideSkill(skill) {
    setTimeout(function() {
      skill.className = '';
    }, Math.random() * 300);
  }

  for (var i = 0; i < skillElems.length; i++) {
    var skill = skillElems[i];
    hideSkill(skill);
  }

  setTimeout(showButtons, 800);
}

function showButtons() {
  document.getElementById('skills').style.display = 'none';
  var buttonElems = document.getElementById('buttons');
  buttonElems.style.display = 'block';
  buttonElems = buttonElems.children;

  function showButton(button, delay) {
    setTimeout(function() {
      button.className = 'show';
    }, delay);
  }

  for (var i = 0; i < buttonElems.length; i++) {
    var button = buttonElems[i];
    showButton(button, (i + 0.5) * 600);
  }
}
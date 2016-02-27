/*!
 * Copyright © 2015 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 * 
 * Description:
 * Client side script.
 */

// DOM Elements.
var content = document.getElementsByClassName('content')[0];
    bio = document.getElementById('bio'),
    h1 = document.getElementsByTagName('h1')[0],
    skills = document.getElementById('skills'),
    skillElems = document.querySelectorAll('#skills > span'),
    skillsButton = document.querySelectorAll('.buttons > .skills')[0],
    backButton = document.querySelectorAll('.buttons > .back')[0],
    preview = document.getElementById('preview'),
    bioButtons = document.querySelectorAll('#bio > .buttons > a');

// Fixed base string in the h1 tag.
var base = 'I\'m Eneko, ';

// Sentences that will rotate in h1 tag.
var sentences = [
  'software engineer',
  'web dev at SmartSea',
  'JS and Node hacker',
  'computer geek',
  'code craftsman',
  'UX and UI designer',
  'problem solver',
  'basque citizen'
];

// Sentence rotation counter.
var i = 0;

/**
 * Schedule rewrite of the h1 tag after 12 seconds with the
 * console promot effect implemented in rewirte() function.
 */
function scheduleRewrite() {
  i++;
  setTimeout(function() {
    rewrite(h1,
            base,
            sentences[i % sentences.length],
            scheduleRewrite);
  }, 10000);
}

// Wait 12 seconds before starting to rotate.
setTimeout(scheduleRewrite, 10000);

// Show biography and buttons.
showBio();

// Add listeners for the "Skills" and "Back" buttons.
skillsButton.addEventListener('click', function(event) {
  event.preventDefault();
  showSkills();
});

backButton.addEventListener('click', function(event) {
  event.preventDefault();
  hideSkills();
});

// Attach preview listeners to anchors in '#bio > .buttons'
// only for screens with viewports wider than 900px.
if (window.matchMedia('(min-width: 900px)').matches) {
  for (var i = 0; i < bioButtons.length; i++) {
    bioButtons[i].addEventListener('mouseenter', showPreview);
    bioButtons[i].addEventListener('mouseleave', hidePreview);
  }
}

/**
 * Waits half a second and changes main content's opacity value to
 * make it appear. A second and a half later, sets the .show class
 * to the #bio element, which changes it's opacity and position.
 * Property changes are animated through CSS transitions.
 */
function showBio() {
  setTimeout(function() {
    content.style.opacity = 1;
    setTimeout(function() {
      bio.className = 'show';
    }, 1000);
  }, 500);
}

/**
 * Triggers some CSS transitions to hide #bio and show #skills.
 */
function showSkills() {

  // Hide biography removing its .show class.
  bio.className = '';

  // Wait 600ms while the dissapearing animation of the 
  // biography completes.
  setTimeout(function() {

    // Hide bio and show skills.
    bio.style.display = 'none';
    skills.style.display = 'block';

    // Start making skill spans appear with
    // a random delay between 10 and 300ms.
    for (var i = 0; i < skillElems.length; i++) {
      var skill = skillElems[i];
      showSkill(skill);
    }

    // Wait 600ms to let the previous animation complete and
    // display the back button setting .show class to it.
    setTimeout(function() {
      backButton.className = 'back show';
    }, 600);

  }, 500);

  function showSkill(skill) {
    setTimeout(function() {
      skill.className = 'show';
    }, (Math.random() * 290) + 10);
  }
}

/**
 * Triggers some CSS transitions to hide #skills and show #bio.
 */
function hideSkills() {

  // Hide back button removing its .show class.
  backButton.className = 'back';

  // Start making skill spans dissappear with
  // a random delay between 10 and 300ms.
  for (var i = 0; i < skillElems.length; i++) {
    var skill = skillElems[i];
    hideSkill(skill);
  }

  // Wait 650ms while the dissapearing animation of the skill
  // spans completes.
  setTimeout(function() {

    // Hide skills and display bio.
    skills.style.display = 'none';
    bio.style.display = 'block';

    // Add .show class to make biography appear. Wait 100ms
    // first to avoid browser skipping the animation.
    setTimeout(function() {
      bio.className = 'show';
    }, 100);
  }, 650);

  function hideSkill(skill) {
    setTimeout(function() {
      skill.className = '';
    }, (Math.random() * 290) + 10);
  }
}

/**
 * Rewrite 'el' element periodically with a string composed by
 * an always static 'base' string and slices of 'sentence' in
 * order to create a writting efect. For example, if:
 *
 *   el.innerHTML = 'Hi! I\'m Eneko!
 *   base = 'Hi!';
 *   sentence = ' How\'s goin\'?';
 *
 * It'll write (el.innerHTML), with a period of a few millisecs:
 *
 *   'Hi! I\'m Eneko!'
 *   'Hi! I\'m Eneko'
 *   'Hi! I\'m Enek'
 *   'Hi! I\'m Ene'
 *
 * And so forth. Then, it will do it forwards with the string
 * provided in 'sentence'.
 * 
 * @param  {Element}   el        HTML DOM Element
 * 
 * @param  {String}    base      Base string that does not
 *                               change.
 *                               
 * @param  {String}    sentence  Sentence that will be sliced
 *                               on each tick.
 * 
 * @param  {Function}  onEnd     Called when the rewrite ends
 *                               (i.e. when the forwards and
 *                               backwards animation ends).
 */
function rewrite(el, base, sentence, onEnd) {
  var oldSentence = el.innerHTML,
      newSentence = base + sentence,
      clk = setInterval(del, 60),
      i = oldSentence.length;

  function del() {
    i--;
    if (base.length <= i) {
      el.innerHTML = oldSentence.substring(0, i);
    } else {
      clearInterval(clk);
      var randTime = 65 + (Math.random() * 15);
      clk = setInterval(write, randTime);
    }
  }

  function write() {
    i++;
    if (newSentence.length >= i) {
      el.innerHTML = newSentence.substring(0, i);
    } else {
      clearInterval(clk);
      if (onEnd) {
        onEnd();
      }
    }
  }
}

// Variable used to hold a reference to the last timeout set
// by the showPreview() function below and which is used by
// hidePreview().
var previewClk;

/**
 * Shows preview corresponding to the hovered button. Triggers
 * some CSS transitions.
 * 
 * @param  {Event}  event  HTML DOM Event.
 */
function showPreview(event) {
  var srcElem = event.srcElement;
  expand(srcElem);

  function expand(elem) {
    previewClk = setTimeout(function() {
      preview.className = elem.className;
      elem.className = elem.className + ' expanded';
    }, 1000);
  }

}

/**
 * Hides preview. Triggers some CSS transitions.
 * 
 * @param  {Event}  event  HTML DOM Event.
 */
function hidePreview(event) {
  clearTimeout(previewClk);
  var srcElem = event.srcElement;
  collapse(srcElem);

  function collapse(elem) {
    preview.className = '';
    elem.className = elem.className.split(' ')[0];
  }
}
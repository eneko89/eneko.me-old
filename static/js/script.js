/*!
 * Copyright © 2015 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 * 
 * Description:
 * Client side script.
 */

// HTML DOM Elements.
var content = document.getElementsByClassName('content')[0];
    bio = document.getElementById('bio'),
    h1 = document.getElementsByTagName('h1')[0],
    skills = document.getElementById('skills'),
    skillElems = document.querySelectorAll('#skills > span'),
    skillsButton = document.querySelectorAll('.buttons > .skills')[0],
    backButton = document.querySelectorAll('.buttons > .back')[0],
    previewElem = document.getElementById('preview'),
    bioButtons = document.querySelectorAll('#bio > .buttons > a');

// True if the viewport is wide enough for previews in '#bio > .buttons',
// which should be available only for wide viewports & non touch devices
// that can handle properly mouseenter and mouseleave. 
var isViewportBig = window.matchMedia('(min-width: 900px)').matches;

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
 * Schedule rewrite of the h1 tag every 10 seconds with the console
 * promot writing effect implemented in the rewirte() function.
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

// Wait 10 seconds before starting to rotate sentences in h1 tag.
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

// Attach preview listeners to anchors in '#bio > .buttons' only
// in wide enough viewports (wider than 900px actually).
if (isViewportBig) {
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
 * Rewrite 'el' element periodically with a string composed by an
 * always static 'base' string and slices of 'sentence' in order
 * to create a console prompt writing effect. For example, if:
 *
 *   el.innerHTML = 'Hi! I\'m Eneko!
 *   base = 'Hi!';
 *   sentence = ' How\'s goin\'?';
 *
 * With a period of a few millisecs, it'll write (el.innerHTML):
 *
 *   'Hi! I\'m Eneko'
 *   'Hi! I\'m Enek'
 *   'Hi! I\'m Ene'
 *   'Hi! I\'m En'
 *
 * And so forth, until it reaches 'base' string. Then, it will do
 * it forwards, writing the string provided in 'sentence'.
 * 
 * @param  {Element}   el        HTML DOM Element
 * 
 * @param  {String}    base      Base string that does not change.
 *                               
 * @param  {String}    sentence  Sentence that will be rewritten.
 * 
 * @param  {Function}  onEnd     Called when the animation ends.
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

/**
 * Fetches data from a JSON API through HTTP GET (XMLHttpRequest).
 * 
 * @param  {String}   url     URL to hit.
 * 
 * @param  {Function} onLoad  Called when the request completes
 *                            with the signature onLoad(err, res),
 *                            where 'res' is the response pasrsed
 *                            as Object and 'err' null if request
 *                            succeeded. Else, it will contain an
 *                            HTTP errcode or -1.
 */
function httpGet(url, onLoad) {
  var request = new XMLHttpRequest();

  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      onLoad(null, JSON.parse(request.responseText));
    } else {
      onLoad(request.status);
    }
  };

  request.onerror = function() {
    request(-1);
  };

  request.send();
}

// Previews that will be lazy-loaded and generated on demand by
// getters below (getGitHubPreview(), getTwitterPreview() and so
// forth).
var gitHubPreview,
    skillsPreview,
    twitterPreview;

/**
 * Fetches eneko89 user's repositories from the GitHub API and
 * generates the GitHub preview markup. It only does it once,
 * subsequent calls will return the cached markup.
 * 
 * @param  {Function}  done  Called on completion with generated
 *                           markup: done(preview). For more info,
 *                           see httpGet() and the GitHub API.                
 */
function getGithubPreview(done) {
  var url = 'https://api.github.com/users/eneko89/repos';

  if (gitHubPreview) {
    done(gitHubPreview);
  } else {
    httpGet(url, function(err, repos) {
      if (!err) {
        console.log(repos);

        // TODO: Implement preview markup creation.
        gitHubPreview = 'PLACEHOLDER!';
        done(gitHubPreview);
      }
    });
  }
} 

/**
 * Fetches @enekodev's tweets from eneko.me/tweets endpoint, which
 * in turn fetches them from Twitter API and generates the Twitter
 * preview markup. This is necessary cause the API uses Oauth, and
 * consumer and API secrets should be kept, ahem... secret. It only
 * does this once, subsequent calls will return the cached markup.
 *                           
 * @param  {Function}  done  Called on completion with generated
 *                           markup: done(preview). For more info,
 *                           see httpGet(), /twitter in index.js
 *                           and the Twitter API.    
 */
function getTwitterPreview(done) {
  var url = '/tweets?count=5';

  if (twitterPreview) {
    done(twitterPreview);
  } else {
    httpGet(url, function(err, tweets) {
      if (!err) {
        console.log(tweets);

        // TODO: Implement preview markup creation.
        twitterPreview = 'PLACEHOLDER!';
        done(twitterPreview);
      }
    });
  }
}

/**
 * TODO: Documentation.
 */
function getSkillsPreview(done) {
  if (!skillsPreview) {
    skillsPreview = '';
    for (var i = 0; i < skillElems.length; i++) {
      var skill = skillElems[i];
      skillsPreview += skill.innerHTML + ' ';
    }
  }
  done(skillsPreview);
}

/**
 * TODO: Documentation.
 */
function getMailPreview(done) {
  done('Click here to send me an e-mail or write to '
        + 'contact@eneko.me or eneko@smartsea.io.');
}

// Variable used to hold a reference to the last timeout set by
// the showPreview() function below and used by hidePreview().
var previewClk;

// Variable used to track if the preview has been canceled (the
// mouse pointer left the button). The 'previewClk' variable is
// not enough, because the preview could be canceled before the
// timeout is set (i.e. while a preview getter is carrying out
// an API request).
var previewCanceled;

/**
 * Shows preview corresponding to the hovered button. Triggers
 * some CSS transitions.
 * 
 * @param  {Event}  event  HTML DOM Event.
 */
function showPreview(event) {
  var elem = event.srcElement,
      getterName = 'get' + toUpperFirst(elem.className) + 'Preview',
      startTime = Date.now();

  // Constant delay to show the preview after hovering a button.
  var DELAY = 1000;

  // Reset cancel state.
  previewCanceled = false;

  // Maybe a little tricky, but it simply calls a preview getter.
  window[getterName](function(preview) {
    if (!previewCanceled) {
      var realDelay = Date.now() - startTime,
          remainingDelay = DELAY - realDelay;

      // If remainingDelay is negative, it has taken longer than a
      // second to complete, so we must show preview immediately.
      if (remainingDelay < 0) {
        remainingDelay = 0;
      }

      // Insert generated preview
      previewElem.innerHTML = '<div>' + preview + '</div>';

      // Wait and show the preview.
      previewClk = setTimeout(function() {
        previewElem.className = elem.className;
        elem.className = elem.className + ' expanded';
      }, remainingDelay);
    }
  });
}

/**
 * Hides preview and triggers some CSS transitions. If a timeout
 * has been previously scheduled by showPreview, cancels it first.
 * 
 * @param  {Event}  event  HTML DOM Event.
 */
function hidePreview(event) {
  var elem = event.srcElement;
  previewCanceled = true;
  clearTimeout(previewClk);
  previewElem.className = '';
  elem.className = elem.className.split(' ')[0];
}

/**
 * Returns a new string with the first letter in the source string
 * converted to uppercase (e.g., mailPreview would be converted to
 * MailPreview).
 * 
 * @param  {String}  str  Source string.
 * 
 * @return {String}       New string with the first letter
 *                        in uppercase.
 */
function toUpperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

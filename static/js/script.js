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
    mergedHoverEvents([bioButtons[i], previewElem],
                      showPreview, hidePreview, true);
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

  /**
   * Deletes content in h1 periodically until it reaches 'base'.
   */
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

  /**
   * Wirtes 'sentence' in h1 periodically and calls onEnd().
   */
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

// Variable to track requests and their callbacks so that httpGet()
// does not make a request to the same URL if the previous has not
// finished.
var requests = {};

/**
 * Fetches data from a JSON API through HTTP GET (XMLHttpRequest).
 *
 * Requests to the same URL before the previous one completes are
 * coalesced and their callbacks receive the same result.
 * 
 * @param  {String}   url     URL to hit.
 * 
 * @param  {Function} onLoad  Called when the request completes
 *                            with the signature onLoad(err, res),
 *                            where 'res' is the response parsed
 *                            as Object and 'err' null if request
 *                            succeeded. Else, it will contain an
 *                            HTTP errcode or -1.
 */
function httpGet(url, onLoad) {
  var request = new XMLHttpRequest();

  if (!requests[url]) {

    requests[url] = { callbacks: [onLoad] };

    request.open('GET', url, true);

    request.onload = function() {
      var callbacks = requests[url].callbacks;
      requests[url] = null;
      
      if (request.status >= 200 && request.status < 400) {
        while (callbacks.length) {
          callbacks.pop()(null, JSON.parse(request.responseText));
        }
      } else {
        while (callbacks.length) {
          callbacks.pop()(request.status);
        }
      }
    };

    request.onerror = function() {
      var callbacks = requests[url].callbacks;
      requests[url] = null;

      while (callbacks.length) {
        callbacks.pop()(-1);
      }
    };

    request.send();
  } else {
    requests[url].callbacks.push(onLoad);
  }
}

// Previews that will be lazy-loaded and generated on demand by
// getters below (getGitHubPreview(), getTwitterPreview() and so
// forth).
var gitHubPreview,
    skillsPreview,
    twitterPreview,
    mailPreview;

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
        gitHubPreview = '';
        for (var i = 0; i < repos.length; i++) {
          gitHubPreview += repoSpan(repos[i]);
        }
        done(gitHubPreview);
      }
    });
  }

  /**
   * Creates markup inside a <span> tag for a repo data object.
   * 
   * @param  {Object} repo  Repo data object (from Github API).
   * 
   * @return {String}       Generated repo markup.
   */
  function repoSpan(repo) {
    return '<span>'
            + anchor(repo.name, repo.html_url) + ' '
            + repo.stargazers_count + ' '
            + repo.forks + ' '
            + repo.description + ' '
            + '</span>';
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
  var url = '/tweets?count=10';

  if (twitterPreview) {
    done(twitterPreview);
  } else {
    httpGet(url, function(err, tweets) {
      if (!err) {
        twitterPreview = '';
        for (var i = 0; i < tweets.length; i++) {
          twitterPreview += tweetSpan(tweets[i]);
        }
        done(twitterPreview);
      }
    });
  }

  /**
   * Creates markup inside a <span> tag for a tweet data object.
   * 
   * @param  {Object} repo  Tweet data object (from Twitter API).
   * 
   * @return {String}       Generated tweet markup.
   */
  function tweetSpan(tweet) {
    return '<span>'
            + tweetAnchor(formattedDate(tweet.created_at),
                          tweet.id) + ' '
            + tweet.retweet_count + ' '
            + tweet.favorite_count + ' '
            + anchorify(tweet.text) + ' '
            + '</span>';
  }

  /**
   * Creates an anchor linking to a @enekodev user's tweet from a
   * tweet id and an anchor text.
   *
   * @param  {String}  text  Anchor text.
   *
   * @param  {String}  id    Tweet id.
   * 
   * @return {String}        Generated anchor tag.
   */
  function tweetAnchor(text, id) {
    return anchor(text,
                  'https://twitter.com/enekodev/status/' + id);
  }

  /**
   * Formats Twitter API returned UTC string into 'DD/MM/YYYY hh:mm'
   * date string format.
   *
   * @param  {String}  dateString  UTC Date string.
   * 
   * @return {String}              'DD/MM/YYYY hh:mm' format string.
   */
  function formattedDate(dateString) {
    var arr = dateString.split(' ');

    // Parse date as UTC string (Twitter's format is not standard
    // and some browser implementations of Date can't parse it).
    var date = new Date(arr[1] + ' '
                         + arr[2] + ', '
                         + arr[5] + ' '
                         + arr[3] + ' UTC');

    return prependZero(date.getDate()) + '/'
            + prependZero(date.getMonth() + 1) + '/'
            + date.getFullYear() + ' '
            + prependZero(date.getHours()) + ':'
            + prependZero(date.getMinutes());

    /**
     * Prepends zero to a numeric value if it's smaller than 10.
     * 
     * @param  {Numer}          num  Number.
     * 
     * @return {String|Number}       String with the number plus
     *                               a leading zero if num < 10.
     *                               Same numeric value otherwise.
     *                               
     */
    function prependZero(num) {
      return num < 10 ? '0' + num
                      : num;
    }
  }
}

/**
 * Generates the skills preview from the content in the #skills
 * element. It does this only once, subsequent calls will return
 * the cached markup.
 * 
 * @param  {Function}  done  Called on completion with generated
 *                           markup: done(preview).
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
 * Generates the mail preview markup. It does this only once,
 * subsequent calls will return the cached markup.
 * 
 * @param  {Function}  done  Called on completion with generated
 *                           markup: done(preview).
 */
function getMailPreview(done) {
  if (!mailPreview) {
    mailPreview = 'Click here to send me an e-mail or write to '
                   + mailAnchor('contact@eneko.me') + ' or '
                   + mailAnchor('eneko@smartsea.io') + '.';
  }
  done(mailPreview);

  /**
   * Creates an anchor with href='mailto:email' and the email
   * itself as the anchor text.
   *
   * @param  {String}  email  E-mail address.
   * 
   * @return {String}         Generated anchor tag.
   */
  function mailAnchor(email) {
    return anchor(email, 'mailto:' + email);
  }
}

// Reference to the last hovered bioButton.
var lastHovered;

// Variable used to hold a reference to the last timeout set by
// the showPreview() function below and used by hidePreview().
var previewClk;

// Variable used to track cancellation state of previews, since
// preview getters can carry out asynchronous tasks. For example:
// { skills: false, github: true, twitter: false, mail: false }.
var canceled = {};

/**
 * Shows hovered button's preview. Triggers some CSS transitions.
 * 
 * It stores a reference to the last timeout set in previewClk
 * and sets cancellation state of the hovered button to false.
 * 
 * @param  {Event}  event  HTML DOM Event.
 */
function showPreview(event) {
  var elem = event.srcElement || event.target,
      getterName = 'get' + toUpperFirst(elem.className) + 'Preview',
      startTime = Date.now();

  // Constant delay to show the preview after hovering a button.
  var DELAY = 1000;

  // Update the reference to the last button hovered.
  lastHovered = elem;

  // Reset element's preview cancellation state.
  canceled[elem.className] = false;

  // Maybe a little tricky, but it simply calls a preview getter.
  window[getterName](function(preview) {
    if (!canceled[elem.className]) {
      var realDelay = Date.now() - startTime,
          remainingDelay = DELAY - realDelay;

      // If remainingDelay is negative, it has taken longer than a
      // second to complete, so we must show preview immediately.
      if (remainingDelay < 0) {
        remainingDelay = 0;
      }

      // Insert generated preview.
      previewElem.innerHTML = '<div>' + preview + '</div>';

      // Wait remaining time until DELAY and...
      previewClk = setTimeout(function() {

        // Show the preview.
        previewElem.className = elem.className;
        previewElem.style.display = 'block';
        elem.className = elem.className + ' expanded';

        // Start preview marquee.
        startMarquee();
      }, remainingDelay);
    }
  });
}

/**
 * Hides preview and triggers some CSS transitions. If a timeout
 * has been previously scheduled by showPreview, clears it first.
 * 
 * It also sets cancellation state or the hovered button to true.
 * 
 * @param  {Event}  event  HTML DOM Event.
 */
function hidePreview(event) {

  // If source element references previewElem, use the reference
  // to the last hovered button.
  var elem = event.srcElement || event.target;
  elem = elem === previewElem ? lastHovered : elem;

  // Clear last timeout.
  clearTimeout(previewClk);

  // Stop preview marquee.
  stopMarquee();

  // Hide preview.
  previewElem.className = '';
  previewElem.style.display = 'none';
  elem.className = elem.className.split(' ')[0];

  // Cancel current preview if it's still in progress (a preview
  // getter can carry out asynchronous tasks; that's why we need
  // this flag).
  canceled[elem.className] = true;
}

// Variable used to hold a reference to the last timeout set by
// startMarquee() function below and used by stopMarquee().
var marqueeClk;

/**
 * Set up and start a CSS transition to create a marquee effect on
 * the child of the #preview element. It also stores a reference to
 * the last timeout set in marqueeClk.
 */
function startMarquee() {

  // Initial delay in seconds.
  var DELAY = 1;

  // Speed in previewElem's width per second. Transition duration
  // is computed so that speed is constant, regardless of the size
  // of previewElem or the amount of text in previewChild.
  var SPEED = 0.1;

  // Child of #preview (which is the element that will be animated)
  // and styles to compute the transition duration.
  var previewChild = previewElem.children[0],
      childStyles = getComputedStyle(previewChild),
      childLeft = parseFloat(childStyles.left),
      duration = (previewChild.scrollWidth + childLeft) /
                  previewElem.clientWidth / SPEED;

  // Set a CSS transition with the computed duration and constant
  // initial delay.
  previewChild.style.transition = 'left ' + duration + 's '
                                   + 'linear ' + DELAY + 's';

  // Set a negative left value that combined with the transition,
  // absolute positioning and parent's hidden overflow creates the
  // marquee effect.
  previewChild.style.left = '-' + previewChild.scrollWidth + 'px';

  // Set a timeout to restart the marquee when it ends until it's
  // externally stopped by stopMarquee().
  marqueeClk = setTimeout(function() {
    stopMarquee();
    startMarquee();
  }, (duration * 1000) + DELAY * 1000);
}

/**
 * Stop CSS marquee transition on the child of #preview element. If
 * a timeout has been previously scheduled by startMarquee(), clears
 * it first.
 */
function stopMarquee() {
  var previewChild = previewElem.children[0];

  // Clear last timeout.
  clearTimeout(marqueeClk);

  // Disable CSS transition and relocate previewChild. If the first
  // preview is canceled early, previewElem could be still empty, so
  // we check if extist first.
  if (previewChild) {
    previewChild.style.transition = 'none';
    previewChild.style.left = previewElem.clientWidth + 'px';
  }
}

// Variable used to hold a reference to the id of the currently
// hovered group if exclusive = true in mergedHoverEvents().
var hoverGroupId = null;

/**
 * Emulates 'mouseenter' and 'mouseleave' on a group of contiguous
 * elements as if they were only one.
 * 
 * @param  {Element[]}  elems        Group of contiguous Elements.
 * 
 * @param  {Function}   onEnter      Called when mouse enters the
 *                                   group of elements.
 * 
 * @param  {Function}   onLeave      Called when mouse leaves the
 *                                   group of elements.
 *
 * @param  {Boolean}    [exclusive]  If true, element groups cannot
 *                                   be hovered simultaneously. This
 *                                   means that in groups with elems
 *                                   in common, it won't notify all
 *                                   groups when entering or leaving
 *                                   the common elem, only the group
 *                                   defined in the first place. It
 *                                   defaults to false.
 */
function mergedHoverEvents(elems, onEnter, onLeave, exclusive) {

  // Variable to track hover state of each element of the group.
  var mouseOver = [];

  // Variable to tell element groups apart if exlusive = true.
  var groupId = exclusive ? Math.random().toString(36).slice(-5)
                          : null;

  // Set 'mouseenter' and 'mouseleave' listeners to each element.
  for (var i = 0; i < elems.length; i++) {

    // Set element's mouseOver to false (not hovered) initially.
    mouseOver[i] = false;

    // If mouse enters an element and no previous one is hovered,
    // fire onEnter().
    elems[i].addEventListener('mouseenter', function(event) {

      if (hoverGroupId === null) {
        hoverGroupId = groupId
      }

      if (groupId === hoverGroupId) {
        if (mouseOver.indexOf(true) === -1) {
          hoverGroupId = groupId;
          onEnter(event);
        }

        var index = elems.indexOf(event.srcElement
                                  || event.target);
        mouseOver[index] = true;
      }
    });

    // If mouse enters an element and no previous one is hovered,
    // fire onLeave(). But...
    elems[i].addEventListener('mouseleave', function(event) {

      // ...here is the catch. Setting an small timeout makes next
      // element's mouseenter event arrive before previous elem's
      // mouseleave, making possible to know if the element left
      // or entered the group.
      setTimeout(function() {
        var index = elems.indexOf(event.srcElement
                                  || event.target);
        mouseOver[index] = false;

        if (mouseOver.indexOf(true) === -1
            && groupId === hoverGroupId) {
          hoverGroupId = null;
          onLeave(event);
        }
      }, 0);

    });
  }
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

/**
 * Creates an anchor tag from the URL and anchor text as params.
 *
 * @param  {String}  text  Anchor text.
 * 
 * @param  {String}  url   Anchor URL.
 * 
 * @return {String}        Generated anchor tag.
 */
function anchor(text, url) {
  return '<a href="' + url + '">' + text + '</a>';
}

/**
 * Looks for URLs in the source text and replaces them with anchor
 * tags. If there are no links in the text, it does nothing.
 * 
 * @param  {String}  text  Source text.
 * 
 * @return {String}        New string with URLs in the source
 *                         text replaced with anchor tags.
 */
function anchorify(text) {
  var urlRegExp = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegExp, function(url) {
      return anchor(url, url);
  });
}

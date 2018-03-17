const tape = require('tape');
require('../dist/tracery');
require('../js/tracery/mods-eng-basic');

var grammar = tracery.createGrammar({

  deepHash: ["\\#00FF00", "\\#FF00FF"],
  deeperHash: ["#deepHash#"],
  animal: ["bear", "cat", "dog", "fox", "giraffe", "hippopotamus"],
  mood: ["quiet", "morose", "gleeful", "happy", "bemused", "clever", "jovial", "vexatious", "curious", "anxious", "obtuse", "serene", "demure"],

  nonrecursiveStory: ["The #pet# went to the beach."],
  //  story : ["#recursiveStory#", "#recursiveStory#", "#nonrecursiveStory#"],
  recursiveStory: ["The #pet# opened a book about[pet:#mood# #animal#] #pet.a#. #story#[pet:POP] The #pet# closed the book."],

  svgColor: ["rgb(120,180,120)", "rgb(240,140,40)", "rgb(150,45,55)", "rgb(150,145,125)", "rgb(220,215,195)", "rgb(120,250,190)"],
  svgStyle: ['style="fill:#svgColor#;stroke-width:3;stroke:#svgColor#"'],

  "name": ["Cheri", "Fox", "Morgana", "Jedoo", "Brick", "Shadow", "Krox", "Urga", "Zelph"],
  "story": ["#hero.capitalize# was a great #occupation#, and this song tells of #heroTheir# adventure. #hero.capitalize# #didStuff#, then #heroThey# #didStuff#, then #heroThey# went home to read a book."],
  "monster": ["dragon", "ogre", "witch", "wizard", "goblin", "golem", "giant", "sphinx", "warlord"],
  "setPronouns": ["[heroThey:they][heroThem:them][heroTheir:their][heroTheirs:theirs]", "[heroThey:she][heroThem:her][heroTheir:her][heroTheirs:hers]", "[heroThey:he][heroThem:him][heroTheir:his][heroTheirs:his]"],
  "setOccupation": ["[occupation:baker][didStuff:baked bread,decorated cupcakes,folded dough,made croissants,iced a cake]", "[occupation:warrior][didStuff:fought #monster.a#,saved a village from #monster.a#,battled #monster.a#,defeated #monster.a#]"],
  "origin": ["#[#setPronouns#][#setOccupation#][hero:#name#]story#"]

});

grammar.addModifiers(baseEngModifiers);
tracery.setRng(function () { return 0; });

var tests = {

  plaintextShort: {
    src: "a",
    expect: "a"
  },
  plaintextLong: {
    src: "Emma Woodhouse, handsome, clever, and rich, with a comfortable home and happy disposition, seemed to unite some of the best blessings of existence; and had lived nearly twenty-one years in the world with very little to distress or vex her.",
    expect: "Emma Woodhouse, handsome, clever, and rich, with a comfortable home and happy disposition, seemed to unite some of the best blessings of existence; and had lived nearly twenty-one years in the world with very little to distress or vex her."
  },

  // Escape chars
  escapeCharacter: {
    src: "\\#escape hash\\# and escape slash\\\\",
    expect: "#escape hash# and escape slash\\"
  },

  escapeDeep: {
    src: "#deepHash# [myColor:#deeperHash#] #myColor#",
    expect: "#00FF00  #00FF00"
  },

  escapeQuotes: {
    src: "\"test\" and \'test\'",
    expect: "\"test\" and 'test'"
  },
  escapeBrackets: {
    src: "\\[\\]",
    expect: "[]"
  },
  escapeHash: {
    src: "\\#",
    expect: "#"
  },
  unescapeCharSlash: {
    src: "\\\\",
    expect: "\\"
  },
  escapeMelange1: {
    src: "An action can have inner tags: \[key:\#rule\#\]",
    expect: "An action can have inner tags: "
  },
  escapeMelange2: {
    src: "A tag can have inner actions: \"\\#\\[myName:\\#name\\#\\]story\\[myName:POP\\]\\#\"",
    expect: "A tag can have inner actions: \"#[myName:#name#]story[myName:POP]#\""
  },

  // Web-specifics
  emoji: {
    src: "💻🐋🌙🏄🍻",
    expect: "💻🐋🌙🏄🍻"
  },

  // unicode: {
  //   src: "&\\#x2665; &\\#x2614; &\\#9749; &\\#x2665;",
  //   expect: "♥ ☔ ☕ ♥"
  // },

  svg: {
    src: '<svg width="100" height="70"><rect x="0" y="0" width="100" height="100" #svgStyle#/> <rect x="20" y="10" width="40" height="30" #svgStyle#/></svg>',
    expect: '<svg width="100" height="70"><rect x="0" y="0" width="100" height="100" style="fill:rgb(120,180,120);stroke-width:3;stroke:rgb(120,180,120)"/> <rect x="20" y="10" width="40" height="30" style="fill:rgb(120,180,120);stroke-width:3;stroke:rgb(120,180,120)"/></svg>'
  },

  // Push
  pushBasic: {
    src: "[pet:#animal#]You have a #pet#. Your #pet# is #mood#.",
    expect: "You have a bear. Your bear is quiet."
  },

  pushPop: {
    src: "[pet:#animal#]You have a #pet#. [pet:#animal#]Pet:#pet# [pet:POP]Pet:#pet#",
    expect: "You have a bear. Pet:bear Pet:bear"
  },

  tagAction: {
    src: "#[pet:#animal#]nonrecursiveStory# post:#pet#",
    expect: "The bear went to the beach. post:bear"
  },

  testComplexGrammar: {
    src: "#origin#",
    expect: "Cheri was a great baker, and this song tells of their adventure. Cheri baked bread, then they baked bread, then they went home to read a book."
  },

  missingModifier: {
    src: "#animal.foo#",
    expect: "bear((.foo))"
  },

  modifierWithParams: {
    src: "[pet:#animal#]#nonrecursiveStory# -> #nonrecursiveStory.replace(beach,mall)#",
    expect: "The bear went to the beach. -> The bear went to the mall."
  },

  recursivePush: {
    src: "[pet:#animal#]#recursiveStory#",
    expect: "The bear opened a book about a quiet bear. Cheri was a great baker, and this song tells of their adventure. Cheri baked bread, then they baked bread, then they went home to read a book. The bear closed the book."
  },

  // Errors

  unmatchedHash: {
    src: "#unmatched",
    expect: "unmatched"
  },
  missingSymbol: {
    src: "#unicorns#",
    expect: "((unicorns))"
  },
  missingRightBracket: {
    src: "[pet:unicorn",
    expect: "pet:unicorn"
  },
  missingLeftBracket: {
    src: "pet:unicorn]",
    expect: "pet:unicorn]"
  },
  justALotOfBrackets: {
    src: "[][]][][][[[]]][[]]]]",
    expect: "][][][][]]]"
  },
  bracketTagMelange: {
    src: "[][#]][][##][[[##]]][#[]]]]",
    expect: "][][((undefined))][][[]]]]"
  },

};

// var testNames = Object.keys(tests);
// Run and report
Object.keys(tests).forEach(key => {
  tape(key, function (t) {
    grammar.clearState();
    console.log (key, tests[key])
    const test = tests[key];
    const root = grammar.expand(test.src);
    t.equal(test.expect, root.finishedText);
    t.end();
  });
});
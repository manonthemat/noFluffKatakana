'use strict';

import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import shuffle from 'knuth';
import KatakanaMap from './katakanamap';

export default class App extends React.Component {
  defaultState = () => {
    return {
      katakanaToSolve: shuffle(Object.keys(KatakanaMap)),
      correct: 0,
      total: 0
    };
  };
  state = this.defaultState();
  reset = () => {
    this.setState(this.defaultState());
  };
  rightChoiceSelected = () => {
    this.setState({
      correct: this.state.correct + 1,
      katakanaToSolve: this.state.katakanaToSolve.splice(1),
      total: this.state.total + 1
    });
  };
  wrongChoiceSelected = () => {
    this.setState({
      katakanaToSolve: this.state.katakanaToSolve.splice(1),
      total: this.state.total + 1
    });
  };
  showKatakanaToSolve = () => (<View><Text style={styles.katakana}>{this.state.katakanaToSolve[0]}</Text></View>);

  showChoices = () => {
    const KatakanaToSolve = this.state.katakanaToSolve[0];
    const CorrectAnswer = KatakanaMap[KatakanaToSolve];

    // build some noise (wrong answers)
    let wrongChoices = [];
    while (wrongChoices.length < 3) {
      let randomKatakana = pickRandomProperty(KatakanaMap);
      if (randomKatakana !== KatakanaToSolve) {
        wrongChoices.push(KatakanaMap[randomKatakana]);
      }
    }

    // build the elements
    let allChoices = wrongChoices.concat(CorrectAnswer);
    shuffle(allChoices);

    const renderChoices = () => {
      return allChoices.map(choice => {
        if (choice !== CorrectAnswer) {
          return (
            <TouchableHighlight underlayColor={styles.wrongChoice} style={styles.choice} onPress={this.wrongChoiceSelected}>
              <Text>{choice}</Text>
            </TouchableHighlight>
          );
        } else {
          return (
            <TouchableHighlight underlayColor={styles.rightChoice} style={styles.choice} onPress={this.rightChoiceSelected}>
              <Text>{CorrectAnswer}</Text>
            </TouchableHighlight>
          );
        }
      });
    };

    return (
      <View style={styles.choices}>
        {renderChoices()}
      </View>
    );
  };

  render() {
    const { correct, total } = this.state;
    const show = () => {
      if (this.state.katakanaToSolve.length) {
        return (
          <View style={styles.main}>
            { this.showKatakanaToSolve() }
            { this.showChoices() }
          </View>
        );
      } else {
        const x = Math.round((correct / total * 100 + 0.00001) * 100) / 100;
        return (
          <View style={styles.main}>
            <Text>{ x }% correct!</Text>
            <TouchableHighlight underlayColor='#00f' onPress={this.reset} style={styles.reset}>
              <Text>Try again</Text>
            </TouchableHighlight>
          </View>
        );
      }
    };
    return (
      <View style={styles.container}>
        <View style={styles.info}>
          <View><Text style={styles.infoText}>Correct: {correct} / {total}</Text></View>
          <View><Text style={styles.infoText}>Remaining: {this.state.katakanaToSolve.length}</Text></View>
        </View>
        { show() }
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  katakana: {
    fontSize: 100,
    color: 'black'
  },
  rightChoice: '#0C0',
  wrongChoice: '#C00',
  choices: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  choice: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 50,
    margin: 2
  },
  reset: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
    height: 50,
    borderRadius: 5
  },
  info: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flexDirection: 'row',
    flex: 2
  },
  infoText: {
    fontSize: 8
  },
  main: {
    flex: 23,
    alignItems: 'center',
    justifyContent: 'center'
  }
};

const pickRandomProperty = obj => {
  let result;
  let count = 0;
  for (var prop in obj)
    if (Math.random() < 1 / ++count) result = prop;
  return result;
};

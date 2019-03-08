'use strict';

import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import shuffle from 'knuth';
import KatakanaMap from './katakanamap';

export default class App extends React.Component {
  defaultState = () => {
    return {
      katakanaToSolve: shuffle(Object.keys(KatakanaMap)),
      correct: 0,
      total: 0,
      mistakes: []
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
  wrongChoiceSelected = (katakana, romaji) => {
    const mistakes = [...this.state.mistakes, { key: katakana, romaji }];
    this.setState({
      katakanaToSolve: this.state.katakanaToSolve.splice(1),
      total: this.state.total + 1,
      mistakes
    });
  };
  showKatakanaToSolve = () => (<View><Text style={styles.katakana}>{this.state.katakanaToSolve[0]}</Text></View>);

  // TODO: refactor to bring down cyclomatix complexity to 2 (currently it's at 3)
  showChoices = () => {
    const KatakanaToSolve = this.state.katakanaToSolve[0];
    const CorrectAnswer = KatakanaMap[KatakanaToSolve];

    // build some noise (wrong answers)
    const wrongChoices = [];
    while (wrongChoices.length < 3) {
      const randomKatakana = pickRandomProperty(KatakanaMap);
      if (randomKatakana !== KatakanaToSolve && !wrongChoices.includes(KatakanaMap[randomKatakana])) {
        wrongChoices.push(KatakanaMap[randomKatakana]);
      }
    }

    // build the elements
    const allChoices = wrongChoices.concat(CorrectAnswer);
    shuffle(allChoices);

    const renderChoices = () => {
      return allChoices.map(choice => {
        return (
          <TouchableOpacity
            style={styles.button}
            onPress={(e) => {choice !== CorrectAnswer ? this.wrongChoiceSelected(KatakanaToSolve, CorrectAnswer) : this.rightChoiceSelected(e)}}
            key={choice}
          >
            <Text>{choice}</Text>
          </TouchableOpacity>
        );
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
    const remaining = this.state.katakanaToSolve.length;
    const show = () => {
      if (remaining) {
        return (
          <View style={styles.main}>
            {this.showKatakanaToSolve()}
            {this.showChoices()}
          </View>
        );
      } else {
        const correctPerc = Math.round(correct / total * 100);
        return (
          <View style={styles.main}>
            <Text>{correctPerc}% correct!</Text>
            <TouchableOpacity onPress={this.reset} style={styles.button}>
              <Text>Try Again</Text>
            </TouchableOpacity>
            <MistakesSummary mistakes={this.state.mistakes} />
          </View>
        );
      }
    };
    return (
      <View style={styles.container}>
        <View style={styles.info}>
          <View><Text style={styles.infoText}>Correct: {correct} / {total}</Text></View>
          <View><Text style={styles.infoText}>Remaining: {remaining}</Text></View>
        </View>
        {show()}
      </View>
    );
  }
}

function MistakesSummary(props) {
  if (!props.mistakes.length) return null;
  return (
      <FlatList
        contentContainerStyle={{ justifyContent: 'space-around' }}
        data={props.mistakes}
        numColumns={3}
        ListHeaderComponent={
          () => <Text>Pay attention to these katakana-romaji pairs.</Text>
        }
        renderItem={
          ({item}) => <Text style={{ width: 100 }}>{item.key}: {item.romaji}</Text>
        }
      >
      </FlatList>
  );
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
  choices: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#CCC',
    borderRadius: 12,
    borderWidth: 1,
    color: 'white',
    justifyContent: 'space-around',
    margin: 6,
    overflow: 'hidden',
    padding: 10,
    width: 180
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
  for (const prop in obj)
    if (Math.random() < 1 / ++count) result = prop;
  return result;
};

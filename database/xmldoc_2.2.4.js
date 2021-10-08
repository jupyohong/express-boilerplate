/**
 * @date 2021.04.30
 * @name xml_parser
 * @description xml에 쿼리별 id를 부여하고 if, foreach, choose, include를 사용할 수 있다.
 */
const xmldoc = require('xmldoc'); // npm i xmldoc

module.exports = {
  _getParamValue: function (keyCondition, paramObject, objectCheck = true) {
    if (keyCondition.startsWith(`'`) || keyCondition.startsWith(`"`)) {
      return keyCondition;
    }

    let keys = keyCondition.split('.');
    let value = paramObject;
    for (let key of keys) {
      if (key.includes('[')) {
        let preKey = key.substring(0, key.indexOf('['));
        let digit = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
        value = value[preKey][digit];
      } else {
        value = value[key];
      }
      if (!value) {
        break;
      }
    }

    if (value === null) {
      return value;
    }

    value = typeof value === 'string' ? `'${value}'` : value;
    if (objectCheck && typeof value === 'object') {
      return value.length ? true : Object.keys(value).length ? true : false;
    }
    return value;
  },
  /**
   *
   * @description strict mode에서는 1. 팔진법 2. with 문 3. delete 4. eval, arguments
   * 5. ES6 새로운 주문어 6. 블록 안에 함수 선언 6. 명백한 에러가 있는 코드 를 사용할 수 없다.
   * @param {*} input 이스케이프 변수명
   * @param {*} param 이스케이프 변수에 들어갈 실제 값
   */
  _testCondition: function (input, param) {
    return new Function(
      `"use strict"; return ${this._condition(input, param)}`
    )();
  },
  _setReturnObject: function (result) {
    let keyString = true;
    if (`(!=)&| `.includes(result.char)) {
      keyString = false;
    } else if (result.char === `'` || result.char === `"`) {
      keyString = true;
    } else if (!result.key && !isNaN(parseInt(result.char))) {
      keyString = false;
    }

    if (
      result.char === ' ' &&
      (result.key.startsWith(`'`) || result.key.startsWith(`"`))
    ) {
      keyString = true;
    }

    if (keyString) {
      result.key += result.char;
    } else if (result.key) {
      result.output += this._getParamValue(result.key, result.param);
      result.output += result.char;
      result.key = '';
    } else {
      result.output += result.char;
    }

    return result;
  },
  /**
   *
   * @description
   * @param {*} input 이스케이프 변수명
   * @param {*} param 이스케이프 변수에 들어갈 실제 값
   */
  _condition: function (input, param) {
    if (!input) {
      return input;
    }

    input = input.replace(/\sand\s/g, ' && ').replace(/\sor\s/g, ' || '); // logical operator change

    let i = 0;
    let boundary = input.length + 1;
    let result = {
      input,
      output: '',
      char: '',
      key: '',
      joiningText: false,
      param: param,
    };

    while (i < boundary) {
      result.char = input.charAt(i);
      result = this._setReturnObject(result);
      i++;
    }

    return result.output;
  },
  /**
   *
   * @param {*} children 쿼리에 해당되는 노드
   * @param {*} queryParam 쿼리문 이스케이프 파라미터
   * @param {*} xmlElement XML 쿼리 노드
   * @returns {String} 최종 완성된 쿼리문
   */
  _recursive: function (children, queryParam, xmlElement) {
    let query = '';
    for (let child of children) {
      switch (child.name) {
        case 'if':
          query = query + this._if(child, queryParam);
          break;
        case 'choose':
          query = query + this._choose(child, queryParam);
          break;
        case 'foreach':
          query = query + this._foreach(child, queryParam);
          break;
        case 'include':
          query = query + this._include(child, queryParam, xmlElement);
          break;
        default:
          query = query + (child.text || '');
          break;
      }
    }

    return query.trim();
  },

  /**
   * @description 요청받은 쿼리문을 찾아 파싱해서 반환
   * @param {String} fileString XML 파일 위치
   * @param {String} sqlId 쿼리문 ID
   * @param {Object} queryParam 쿼리문 이스케이프 파라미터
   * @returns {String} 완성된 쿼리 문자열
   */
  queryParser: async function (fileString, sqlId, queryParam) {
    let xmlNode = new xmldoc.XmlDocument(fileString);
    let xmlElement = xmlNode.descendantWithPath('query');
    let queryChildren = xmlElement.children;
    let targetChildren = null;
    let i = 0;
    let length = queryChildren.length;
    while (i < length) {
      if (queryChildren[i].attr && queryChildren[i].attr.id === sqlId) {
        targetChildren = queryChildren[i].children;
        break;
      }
      i++;
    }

    return targetChildren
      ? this._recursive(targetChildren, queryParam, xmlElement)
      : `sqlId : [ ${sqlId} ] not found.`;
  },

  _if: function (child, queryParam) {
    return this._testCondition(child.attr.test, queryParam)
      ? this._recursive(child.children, queryParam)
      : '';
  },

  _choose: function (child, queryParam) {
    let query = '';
    let i = 0;
    let length = child.children.length;
    while (i < length) {
      let choosen = child.children[i];
      i++;

      if (choosen.text) {
        query = query + ' ' + choosen.text;
        continue;
      }

      if (
        choosen.name === 'when' &&
        this._testCondition(choosen.attr.test, queryParam)
      ) {
        query = query + ' ' + this._recursive(choosen.children, queryParam);
        break;
      }

      if (choosen.name === 'otherwise') {
        query = query + ' ' + this._recursive(choosen.children, queryParam);
      }
    }
    return query;
  },

  _foreach: function (child, queryParam) {
    let {
      item = 'value',
      index: indexName,
      collection,
      open = '',
      separator = ',',
      close = '',
    } = child.attr;
    let query = '';

    if (!collection) {
      return query;
    }

    collectionValue = this._getParamValue(collection, queryParam, false);
    if (!collectionValue) {
      return query;
    }

    for (let i = 0; i < collectionValue.length; i++) {
      let children = child.children;
      for (let j = 0; j < children.length; j++) {
        if (children[j].text) {
          query = query + children[j].text.trim();
        }
        if (children[j].children) {
          query =
            query +
            this._recursive(children[j].children, {
              [item]: collectionValue[i],
            }); // node, paramObject
        }
      }

      query = query.replace(/\#\{\s+/g, '#{').replace(/\s+\}/g, '}'); // remove space
      let array = [...query.matchAll(/\#\{((?!\#\{).)*\}/g)]; // #{item.parttern....}
      for (let matchResult of array) {
        let matchVal = this._getParamValue(
          matchResult[0].replace(/\#\{/g, '').replace(/\}/g, ''),
          { [item]: collectionValue[i] },
          false
        );
        query = query.replace(matchResult[0], matchVal);
      }
      if (i !== collectionValue.length - 1) {
        query = query + separator;
      }
    }

    // query = query.substr(0, query.length - 1);
    if (open && close) {
      query = open + query + close;
    }

    return query;
  },

  _convertArrayToObject: (array, key) => {
    const initialValue = {};
    return array.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.attr[key]]: currentValue,
      };
    }, initialValue);
  },

  _filterItem: (array, key, val) => {
    return array.filter(child => {
      return child[key] === val;
    });
  },

  _include: function (child, queryParam, xmlElement) {
    let query = '';
    let { refid = '' } = child.attr;
    if (refid) {
      let includeSqls = this._convertArrayToObject(
        this._filterItem(xmlElement.children, 'name', 'sql'),
        'id'
      );
      let properties = this._convertArrayToObject(
        this._filterItem(child.children, 'name', 'property'),
        'name'
      );
      for (let include of includeSqls[refid].children) {
        if (include.text) {
          query = query + ' ' + (include.text ? include.text : '').trim();
          query = query
            .replace(/#{\s+/g, '#{')
            .replace(/\${\s+/g, '${')
            .replace(/\s+}/g, '}'); // space trim
          for (let propertyName of Object.keys(properties)) {
            // #{value} => 'value'
            query = query.replace(
              '#{' + propertyName + '}',
              this._getParamValue(
                properties[propertyName].attr.value,
                queryParam,
                false
              )
            );

            // ${value} => value
            query = query.replace(
              '${' + propertyName + '}',
              properties[propertyName].attr.value
            );
          }
        } else {
          if (include.name === 'include') {
            query =
              query + ' ' + this._recursive([include], queryParam, xmlElement);
          } else {
            query = query + ' ' + this._recursive(include.children, queryParam);
          }
        }
      }
    } else {
      query = child.firstChild.text;
      for (let propertyName of Object.keys(queryParam)) {
        // ${value} => value
        query = query.replace(
          '${' + propertyName + '}',
          queryParam[propertyName]
        );
      }
    }

    return query;
  },
};

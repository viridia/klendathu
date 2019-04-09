import bind from 'bind-decorator';
import * as React from 'react';
import { Project } from '../../../../common/types/graphql';
import { FieldType } from '../../../../common/types/json';
import { Autocomplete, SearchCallback } from '../../controls';

function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

interface Props {
  project: Project;
  field: FieldType;
  value: string;
  onChange: (id: string, value: string) => void;
}

// tslint:disable:max-classes-per-file
class StringAutocomplete extends Autocomplete<string> {}

export class CustomSuggestField extends React.Component<Props> {
  private reList: RegExp[];

  // allowNew={true}
  public render() {
    const { field, value } = this.props;
    return (
      <StringAutocomplete
        className="keywords ac-multi"
        textValue={value}
        selection={null}
        maxLength={field.maxLength}
        suggest={true}
        onSearch={this.onSearch}
        onGetValue={this.onGetValue}
        onGetSortKey={this.onGetSortKey}
        onChooseSuggestion={this.onChooseSuggestion}
        onRenderSuggestion={this.onRenderSuggestion}
        onRenderSelection={this.onRenderSelection}
        onSelectionChange={this.onChangeValue}
        onValueChange={this.onChangeValue}
      />
    );
  }

  @bind
  private onSearch(search: string, callback: SearchCallback<string>) {
    if (search.length < 1) {
      callback([]);
    } else {
      const terms = search.split(/\s+/);
      this.reList = terms.map(term => new RegExp(`(^|\\s)${escapeRegExp(term)}`, 'i'));
      // TODO: search for suggestions on the server.
      // this.props.client.query<{ searchCustomFields: string[] }>({
      //   query: SearchCustomFieldsQuery,
      //   variables: {
      //     search,
      //     field: this.props.field.id,
      //     project: this.props.project.id,
      //   },
      // }).then(resp => {
      //   callback(resp.data.searchCustomFields);
      // });
    }
  }

  @bind
  private onRenderSuggestion(text: string) {
    const tlist = [text];
    for (const re of this.reList) {
      for (let i = 0; i < tlist.length; i += 2) {
        const split = this.highlightMatches(re, tlist[i]);
        if (split !== null) {
          tlist.splice(i, 1, ...split);
          break;
        }
      }
    }
    const parts: JSX.Element[] = [];
    tlist.forEach((tx, i) => {
      if (i % 2) {
        parts.push(<strong key={i}>{tx}</strong>);
      } else if (tx.length > 0) {
        parts.push(<span key={i}>{tx}</span>);
      }
    });
    return <span className="suggestion">{parts}</span>;
  }

  @bind
  private onRenderSelection(text: string) {
    return text;
  }

  @bind
  private onGetValue(text: string) {
    return text;
  }

  @bind
  private onChangeValue(value: string) {
    if (value !== null) {
      this.props.onChange(this.props.field.id, value);
    }
  }

  @bind
  private onChooseSuggestion() {
    return false;
  }

  @bind
  private onGetSortKey(suggestion: string) {
    return ('' + suggestion).toLowerCase();
  }

  private highlightMatches(re: RegExp, str: string) {
    const m = str.match(re);
    if (m) {
      const mtext = m[0];
      return [
        str.slice(0, m.index),
        mtext,
        str.slice(m.index + mtext.length),
      ];
    }
    return null;
  }
}

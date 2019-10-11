import React from 'react';
import equal from 'equals';
import deepMerge from 'deepmerge';
import propTypes from 'prop-types';
import { CarouselPropTypes } from '../helpers';

export default function WithStore(
  WrappedComponent,
  /* istanbul ignore next */ mapStateToProps = () => ({}),
) {
  class Wrapper extends React.Component {
    static propTypes = {
      children: CarouselPropTypes.children,
      currentWindow: propTypes.object,
      currentDocument: propTypes.object,
    };

    static defaultProps = {
      children: null,
      currentWindow: null,
      currentDocument: null,
    };

    static contextTypes = {
      carouselStore: propTypes.object,
    };

    constructor(props, context) {
      super(props, context);
      this.state = mapStateToProps({ ...context.carouselStore.state });
      this.updateStateProps = this.updateStateProps.bind(this);
      this.context.carouselStore.subscribe(this.updateStateProps);
    }

    shouldComponentUpdate(nextProps, nextState) {
      const test = !equal(nextState, this.state) || !equal(nextProps, this.props);
      return test;
    }

    componentWillUnmount() {
      this.context.carouselStore.unsubscribe(this.updateStateProps);
    }

    updateStateProps() {
      this.setState(mapStateToProps({ ...this.context.carouselStore.state }));
    }

    render() {
      const { currentWindow = null, currentDocument = null, ...rest } = this.props;

      const props = deepMerge(this.state, rest);

      if (currentWindow !== null) {
        props.currentWindow = currentWindow;
      }

      if (currentDocument !== null) {
        props.currentdocument = currentDocument;
      }

      return (
        <WrappedComponent
          ref={(el) => {
            this.instance = el;
          }} // allows access to refs in wrapped components.
          {...props}
          carouselStore={{
            getStoreState: this.context.carouselStore.getStoreState,
            masterSpinnerError: this.context.carouselStore.masterSpinnerError,
            masterSpinnerSuccess: this.context.carouselStore.masterSpinnerSuccess,
            setStoreState: this.context.carouselStore.setStoreState,
            subscribeMasterSpinner: this.context.carouselStore.subscribeMasterSpinner,
            unsubscribeAllMasterSpinner: this.context.carouselStore.unsubscribeAllMasterSpinner,
            unsubscribeMasterSpinner: this.context.carouselStore.unsubscribeMasterSpinner,
          }}
        >
          {this.props.children}
        </WrappedComponent>
      );
    }
  }

  return Wrapper;
}

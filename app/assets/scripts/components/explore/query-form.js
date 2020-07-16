import React, { useState } from 'react';
import styled from 'styled-components';
import T from 'prop-types';
import { themeVal, makeTitleCase } from '../../styles/utils/general';
import {
  PanelBlock,
  PanelBlockHeader,
  PanelBlockFooter
} from '../common/panel-block';
import TabbedBlockBody from '../common/tabbed-block-body';
import Button from '../../styles/button/button';
import SliderGroup from '../common/slider-group';
import Dropdown from '../common/dropdown';
import StressedFormGroupInput from '../common/stressed-form-group-input';
import Heading, { Subheading } from '../../styles/type/heading';
import { FormSwitch } from '../../styles/form/switch';
import { glsp } from '../../styles/utils/theme-values';
import collecticon from '../../styles/collecticons';

import { Accordion, AccordionFold } from '../../components/accordion';

const INIT_GRID_SIZE = 1;
const DEFAULT_RANGE = [0, 100];
const DEFAULT_UNIT = '%';

const PanelOption = styled.div`
  ${({ hidden }) => hidden && 'display: none;'}
  margin-bottom: 1.5rem;
`;

const PanelOptionTitle = styled.div`
  opacity: 0.9;
  font-size: 0.875rem;
  font-weight: ${themeVal('type.base.bold')};
`;
const HeadOption = styled.div`
  box-shadow: 0px 1px 0px 0px ${themeVal('color.baseAlphaB')};
  padding: 1rem 0;
`;

const OptionHeadline = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const FormWrapper = styled.section`
  ${({ active }) => {
    if (!active) { return 'display: none;'; }
  }
  }
`;

const FormGroupWrapper = styled.div`
  box-shadow: 0px 1px 0px 0px ${themeVal('color.baseAlphaB')};
  padding: 1rem 0;
`;

const EditButton = styled(Button).attrs({
  variation: 'base-plain',
  size: 'small',
  useIcon: 'pencil',
  hideText: true
})`
  opacity: 50%;
`;

export const AccordionFoldTrigger = styled.a`
  display: flex;
  align-items: center;
  margin: -${glsp(0.5)} -${glsp()};
  padding: ${glsp(0.5)} ${glsp()};

  &,
  &:visited {
    color: inherit;
  }
    &:active {
        transform: none;
    }
  &:after {
    ${collecticon('chevron-down--small')}
    margin-left: auto;
    transition: transform 240ms ease-in-out;
    transform: ${({ isExpanded }) =>
      isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const SubmissionSection = styled(PanelBlockFooter)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0rem 1rem;
`;

const initListToState = (list) => {
  return list.map((obj) => ({
    ...obj,
    range: obj.range || DEFAULT_RANGE,
    unit: obj.unit || DEFAULT_UNIT,
    active: obj.active === undefined ? true : obj.active
  }));
};

const initObjectToState = (obj) => {
  return Object.keys(obj).reduce((accum, key) => {
    return ({
      ...accum,
      [key]: initListToState(obj[key])
    });
  }, {});
};

const updateStateList = (list, i, updatedValue) => {
  const updated = list.slice();
  updated[i] = updatedValue;
  return updated;
};

function QueryForm (props) {
  const {
    country,
    resource,
    weightsList,
    filtersLists,
    lcoeList,
    presets,
    onCountryEdit,
    onResourceEdit
  } = props;
  const [gridSize, setGridSize] = useState(INIT_GRID_SIZE);

  const [weights, setWeights] = useState(initListToState(weightsList));
  const [filters, setFilters] = useState(initObjectToState(filtersLists));
  const [lcoe, setLcoe] = useState(lcoeList.map((e) => ({ ...e, value: '' })));

  const applyClick = () => {
    // handle submission and search
  };

  const resetClick = () => {
    setWeights(initListToState(weightsList));
    setFilters(initObjectToState(filtersLists));
    setLcoe(initListToState(lcoeList));
  };

  return (
    <PanelBlock>
      <PanelBlockHeader>
        <HeadOption>
          <Subheading>Country</Subheading>
          <OptionHeadline>
            <Heading size='large' variation='primary'>{country}</Heading>
            <EditButton onClick={onCountryEdit}>
                Edit Country Selection
            </EditButton>
          </OptionHeadline>
        </HeadOption>

        <HeadOption>
          <Subheading>Resource</Subheading>

          <OptionHeadline>
            <Heading size='large' variation='primary'>{resource}</Heading>
            <EditButton onClick={onResourceEdit}>Edit Resource Selection</EditButton>
          </OptionHeadline>
        </HeadOption>

        <HeadOption>
          <Subheading>Grid Size</Subheading>
          <OptionHeadline>
            <Heading>
              {gridSize} km<sup>2</sup>
            </Heading>
            <Dropdown
              alignment='right'
              direction='down'
              triggerElement={<EditButton>Edit Grid Size</EditButton>}
            >
              <SliderGroup
                unit='km^2'
                range={[1, 24]}
                value={gridSize}
                onChange={(v) => setGridSize(v)}
              />
            </Dropdown>
          </OptionHeadline>
        </HeadOption>
      </PanelBlockHeader>

      <TabbedBlockBody>
        <FormWrapper
          name='weights'
          icon='sliders-horizontal'
          presets={presets.weights}
          setPreset={(preset) => {
            if (preset === 'reset') {
              setWeights(initListToState(weightsList));
            } else {
              setWeights(initListToState(presets.weights[preset]));
            }
          }}
        >
          {weights.map((weight, ind) => (
            <PanelOption key={weight.name}>
              <PanelOptionTitle>{weight.name}</PanelOptionTitle>
              <SliderGroup
                unit={weight.unit || '%'}
                range={weight.range || [0, 100]}
                id={weight.name}
                value={
                  weight.value === undefined ? weight.range[0] : weight.value
                }
                onChange={(value) => {
                  setWeights(
                    updateStateList(weights, ind, { ...weight, value })
                  );
                }}
              />
            </PanelOption>
          ))}
        </FormWrapper>

        <FormWrapper
          name='filters'
          icon='compass'
          presets={presets.filters}
          setPreset={(preset) => {
            if (preset === 'reset') {
              setFilters(initObjectToState(filtersLists));
            } else {
              setFilters(initObjectToState(presets.filters[preset]));
            }
          }}

        >
          <Accordion
            initialState={[true, ...Object.keys(filters).slice(1).map(_ => false)]}
          >
            {({ checkExpanded, setExpanded }) => (
              Object.entries(filters)
                .map(([group, list], idx) => {
                  return (
                    <AccordionFold
                      key={group}
                      forwardedAs={FormGroupWrapper}
                      isFoldExpanded={checkExpanded(idx)}
                      setFoldExpanded={(v) => setExpanded(idx, v)}
                      renderHeader={({ isFoldExpanded, setFoldExpanded }) => (
                        <AccordionFoldTrigger
                          isExpanded={isFoldExpanded}
                          onClick={() => setFoldExpanded(!isFoldExpanded)}
                        >
                          <Heading size='medium' variation='primary'>
                            {makeTitleCase(group.replace(/_/g, ' '))}
                          </Heading>
                        </AccordionFoldTrigger>
                      )}
                      renderBody={({ isFoldExpanded }) => (
                        list.map((filter, ind) => (
                          <PanelOption key={filter.name} hidden={!isFoldExpanded}>
                            <OptionHeadline>
                              <PanelOptionTitle>{filter.name}</PanelOptionTitle>
                              <FormSwitch
                                hideText
                                name={`toggle-${filter.name.replace(/ /g, '-')}`}
                                disabled={filter.disabled}
                                checked={filter.active}
                                onChange={() => {
                                  setFilters({
                                    ...filters,
                                    [group]: updateStateList(list, ind, { ...filter, active: !filter.active })
                                  });
                                }}
                              >
                                Toggle filter
                              </FormSwitch>

                            </OptionHeadline>
                            <SliderGroup
                              unit={filter.unit}
                              range={filter.range}
                              id={filter.name}
                              value={
                                filter.value === undefined ? filter.range[0] : filter.value
                              }
                              onChange={(value) => {
                                setFilters({
                                  ...filters,
                                  [group]: updateStateList(list, ind, { ...filter, value })
                                });
                              }}
                            />
                          </PanelOption>
                        )))}
                    />

                  );
                })
            )}

          </Accordion>
        </FormWrapper>

        <FormWrapper
          name='lcoe'
          icon='disc-dollar'
          presets={presets.lcoe}
          setPreset={(preset) => {
            if (preset === 'reset') {
              setLcoe(initListToState(lcoeList));
            } else {
              setLcoe(initListToState(presets.lcoe[preset]));
            }
          }}
        >
          {lcoe.map((filter, ind) => (
            <PanelOption key={filter.name}>
              <StressedFormGroupInput
                inputType='number'
                inputSize='small'
                id={`${filter.name}`}
                name={`${filter.name}`}
                label={filter.name}
                value={filter.value || ''}
                validate={() => true}
                onChange={(v) => {
                  setLcoe(updateStateList(lcoe, ind, { ...filter, value: v }));
                }}
              />
            </PanelOption>
          ))}
        </FormWrapper>
      </TabbedBlockBody>

      <SubmissionSection>
        <Button
          type='reset'
          size='small'
          onClick={resetClick}
          variation='base-raised-light'
          useIcon='arrow-loop'
        >
          Reset
        </Button>
        <Button
          type='submit'
          size='small'
          onClick={applyClick}
          variation='primary-raised-dark'
          useIcon='tick--small'
        >
          Apply
        </Button>
      </SubmissionSection>
    </PanelBlock>
  );
}

FormWrapper.propTypes = {
  setPreset: T.func.isRequired,
  presets: T.oneOfType([T.object, T.array]).isRequired,
  name: T.string,
  icon: T.string
};

QueryForm.propTypes = {
  country: T.string,
  resource: T.string,
  weightsList: T.array,
  filtersLists: T.object,
  lcoeList: T.array,
  onResourceEdit: T.func,
  onCountryEdit: T.func,
  presets: T.object
};

export default QueryForm;

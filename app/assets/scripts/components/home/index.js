import React from 'react';
import styled from 'styled-components';
import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../../styles/inpage';
import Button from '../../styles/button/button';
import Prose from '../../styles/type/prose';
import { themeVal, filterComponentProps } from '../../styles/utils/general';
import HomepageBackground from './background';

import { Link } from 'react-router-dom';

// See documentation of filterComponentProp as to why this is
const propsToFilter = ['variation', 'size', 'hideText', 'useIcon', 'active'];
const StyledLink = filterComponentProps(Link, propsToFilter);

const HomeInpage = styled(Inpage)`
  background: rgb(2, 0, 36);
  color: ${themeVal('color.background')};
  padding-top: 12rem;
  position: relative;
  p, ${Button} {
    margin-top: 4rem;
    margin-right: 1rem;
  }
  ${InpageBodyInner} {
    max-width: 40rem;
  }
`;

const HomeTitle = styled(InpageTitle)`
  font-size: 3.5rem;
  line-height: 4rem;
  
  span {
    font-size: 1.25rem;
    text-transform: uppercase;
    display: block;
  }
`;

const Lead = styled(Prose)`
  font-size: 1.25rem;
  line-height: 2rem;
`;

const BackgroundWrapper = styled.figure`
  display: block;
  position: absolute;
  top: 30vh;
  left: 50vw;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;
const PartnerLogos = styled.ul`
  display: flex;
  list-style: none;
  margin-top: 2rem;
  li {
    margin-right: 2rem;
  }
`;

function Home () {
  return (
    <App pageTitle='Home'>
      <HomeInpage>
        <InpageHeader>
          <InpageHeaderInner>
            <InpageHeadline>
              <HomeTitle size='xlarge'>
                <span>Welcome to </span>
                Rezoning
              </HomeTitle>
            </InpageHeadline>
          </InpageHeaderInner>
        </InpageHeader>
        <InpageBody>
          <InpageBodyInner>
            <Lead>
              Identify and explore high potential project areas for solar, wind
              and offshore wind development
            </Lead>
            <Button
              as={StyledLink}
              to='/explore'
              variation='primary-raised-dark'
              size='xlarge'
              title='Visit Explore Page'
            >
              Explore
            </Button>
            <Button
              as={StyledLink}
              to='/about'
              variation='base-raised-light'
              size='xlarge'
              title='Visit About Page'
            >
              Learn More
            </Button>
            <p>Inspired by <a href='https://mapre.lbl.gov/'>MapRE</a></p>
            <PartnerLogos>
              <li><img src='https://via.placeholder.com/140x60.png?text=Partner Logo 1' /></li>
              <li><img src='https://via.placeholder.com/140x60.png?text=Partner Logo 2' /></li>
            </PartnerLogos>
          </InpageBodyInner>
        </InpageBody>
      </HomeInpage>
      <BackgroundWrapper>
        <HomepageBackground />
      </BackgroundWrapper>
    </App>
  );
}

export default Home;

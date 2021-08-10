import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import "./index.css"
const itemData = require("./images.js");

//Required modules
const ipfsAPI = require('ipfs-api');
//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

const Moralis  = require('moralis/node');
Moralis.initialize("6c6GVEQU3vzBwXsO5sfKSxa9zFddpxTXpiXIwC71");
Moralis.serverURL = 'https://py4aahfunxcm.usemoralis.com:2053/server';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nfts: [],
    }
    this.componentDidMount = this.componentDidMount.bind(this);
   }

   componentDidMount(){
    let transformed = [];
     Moralis.Web3.authenticate().then((user) => {
      Moralis.Web3.getNFTs({chain:'eth',address: '0xd9dcc3af32bb84e15bb7bffcead280384c47066e'}).then(async (nfts) => {
        for (let nft of nfts) {
          let res = await fetch(nft.token_uri);
          let meta = await res.json();
          let url_split = meta.image.split('/');
          if (url_split[0] === 'ipfs:') {
            let image_id = url_split.reverse()[1];
            let file_name = url_split[0]
            nft.src = "https://ipfs.moralis.io:2053/ipfs/" + image_id + "/" + file_name;
          } else {
            nft.src = meta.image;
          }
          transformed.push(nft);
        }
        this.setState({nfts: transformed});
      })
     })
   }


   render() {
     return (

        <div className="root">
           <ImageList rowHeight={180} className="imageList">
        <ImageListItem key="Subheader" cols={3} style={{ height: 'auto' }}>
          <ListSubheader component="div">NFTs</ListSubheader>
        </ImageListItem>
        {this.state.nfts.map((item) => (
          <ImageListItem key={item.token_uri}>
            <img src={item.src} alt={item.name} />
            <ImageListItemBar
              title={item.name}
              subtitle={<span>{item.symbol}</span>}
              actionIcon={
                <IconButton aria-label={`info about ${item.name}`} className="icon">
                  <InfoIcon />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </div>

      )
   }
}
export default App;

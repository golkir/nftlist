import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Input, FormControl } from '@material-ui/core';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import "./index.css"
const itemData = require("./images.js");
const axios = require('axios');
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
     Moralis.Web3.authenticate().then(async (user) => {
       await this.getNfts('eth', user.address);
     })
   }

   handleWalletSelect = async (event) => {

      await this.getNfts('eth', event.target.value);
   }

   getNfts = async(chain, address) => {
    let transformed = [];
    let opts = {
      chain: chain ? chain : 'eth',
      address: address
    }

    Moralis.Web3.getNFTs(opts).then(async (nfts) => {
        for (let nft of nfts) {

          console.log(nft);
          
          if (!nft.token_uri){
            continue;
          }

          let meta = await this.getNFTMeta(nft.token_uri);

          if (meta && meta.image) {

            let url_split = meta.image.split('/');
            let protocol = url_split[0];
            let image_id = url_split.reverse()[1];
            let file_name = url_split[0]
            let ext = file_name.split('.')[1]
            let isImage = ext === 'png' || file_name === 'gif' || file_name === 'jpg' || file_name === 'jpeg';

            if (protocol === 'ipfs:') {
               nft.src = "https://ipfs.io/ipfs/" + image_id + '/' + file_name;
            }  
            else { nft.src = meta.image }
          } 
          else if (nft.token_uri) {
            nft.src = nft.token_uri;
          } 
          transformed.push(nft);
        }
        this.setState({nfts: transformed});
      })
   }

   getNFTMeta = async (url) => {
     let res;
     let params = {url: url};

     try {
      res =  await Moralis.Cloud.run("getImage", params);
      if (res && res.data) { return res.data; }
      }
     catch(e){
      console.error(e);
     }
   }

   render() {
     return (
        <div className="root">
          <FormControl fullWidth variant="outlined">
          <TextField id="standard-basic" label="Paste any ETH address" onChange={this.handleWalletSelect} />
          </FormControl>
          <ImageList rowHeight={180} className="imageList">
          <ImageListItem key="Subheader" cols={3} style={{ height: 'auto' }}>
          <ListSubheader component="div">NFTs</ListSubheader>
          </ImageListItem>
          {this.state.nfts.map((item,index) => (
          <ImageListItem key={index}>
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

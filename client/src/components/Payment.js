import { useState } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import TxList from "./TxList";
import axios from "axios";
import {useHistory} from "react-router-dom";

const startPayment = async ({ setError, setTxs, ether, addr, songId, partId, history }) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        ethers.utils.getAddress(addr);
        const tx = await signer.sendTransaction({
            to: addr,
            value: ethers.utils.parseEther(ether)
        });
        console.log({ ether, addr });
        history.push(`/editProduct?songId=${songId}&partId=${partId}`);

        console.log("tx", tx);
        setTxs([tx]);
        // I would need to send information here.
        console.log(tx.from, songId, partId)
        axios({
            
            method: 'post',
            // url: 'https://audio-summarization.uc.r.appspot.com/formsubmission',
            url: 'http://localhost:8080/buySongPart',
            data: {
                "owner": tx.from,
                "songId":songId,
                'partId': partId
                
            },
        
        })
            .then((res) => {
                console.log(res.data);
               

            })
            .catch((err) => {
              
                console.log(err)
            });



    } catch (err) {
        setError(err.message);
    }
};

export default function PaymentForm(props) {
    let history = useHistory();
    const [error, setError] = useState();
    const [txs, setTxs] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        setError();
        await startPayment({
            setError,
            setTxs,
            ether: "0.00025",
            addr: "0x8ab77071108dd6971834848a45a7409624C3eB2a",
            songId: props.songId,
            partId: props.part-1,
            history: history,
        });
    };

    return (
        <form className="m-4 rounded change-font border border-white br-3" style={{ backgroundColor: "#333333" }} onSubmit={handleSubmit}>
            <div className="">
                <main className="mt-4 p-4">
                    <h3 className="text-center">
                        Send ETH Payment
                    </h3>
                    <h4 className="text-center">Your payment is 0.00025 for Song {props.songNo} Part {props.part}</h4>
                    {/* <div className="">
            <div className="my-3">
              <input
                type="text"
                name="addr"
                className="form-control change-color"
                style={{backgroundColor: "#333333", color: "white", "::placeholder":"white"}}
                placeholder="Recipient Address"
              />
              <small id="emailHelp" className="change-color form-text text-muted">We support MetaMask!</small>
            </div>
            <div className="my-3">
              <input
                name="ether"
                type="text"
                className="form-control change-color"
                style={{backgroundColor: "#333333", color: "white"}}
                placeholder="Amount in ETH"
              />
            </div>
          </div> */}
                </main>
                <footer className="p-3">
                    <button
                        type="submit"
                        className="btn btn-primary submit-button w-100"
                    >
                        Pay now
                    </button>
                    <ErrorMessage message={error} />
                    <TxList txs={txs} />
                </footer>
            </div>
        </form>
    );
}
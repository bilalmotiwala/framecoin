"use client";
import React, { useEffect, useState } from 'react';
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/card";
import { db } from '../firebase';
import { Button } from '@nextui-org/button';
import { Avatar } from '@nextui-org/avatar';
import { Skeleton } from "@nextui-org/skeleton";
import { useParams } from 'next/navigation';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export default function TokenPage() {
  
  const { tokenAddress } = useParams();
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [data, setData] = useState(null as any);

  useEffect(() => {
    if (!tokenAddress) return;
    const fetchData = async() => {
      const queryRef = query(collection(db, "tokens"), where("contractAddress", "==", tokenAddress));
      const unsubscribe = onSnapshot(queryRef, async(querySnaphot) => {
        if(!querySnaphot.empty){
          const tokenData = querySnaphot.docs[0].data();
          setData(tokenData);
          console.log("Token Data: ", tokenData);
        } else {
          console.log("No token found");
        }
        setLoading(false);
      });
      return unsubscribe;
    }

    fetchData();
  }, [tokenAddress]);

  const copyToClipboard = async(link: string) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  }

  return (
    <div>
      {loading ? (
        <div className='w-full px-4'>
          <Skeleton className='w-[250px] h-[300px] md:w-[500px] md:h-[250px] rounded-xl' />
        </div>
      ) : !loading && data ? (
        <Card className="max-w-[500px] p-4">
          <CardHeader className="justify-between">
            <div className="flex gap-5 items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center">
                <h4 className="text-small font-semibold leading-none text-default-600">{data?.name}</h4>
                <h5 className="text-small tracking-tight text-default-400">{data?.ticker}</h5>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-3 py-0 text-small text-default-400">
          </CardBody>
          <CardFooter className="gap-3">
            <Button
              color="primary"
              radius="full"
              size="sm"
              variant='solid'
              onPress={() => copyToClipboard(`https://api.framecoin.lol/${data?.contractAddress}`)}
            >
              Copy Frame Link
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="w-full flex items-center justify-center">
          <h1 className="text-lg text-default-600">No token found</h1>
        </div>
      )}
    </div>
  )
}

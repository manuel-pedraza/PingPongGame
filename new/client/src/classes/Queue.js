// Simple Queue Implementation: https://www.geeksforgeeks.org/implementation-queue-javascript/


// Queue class
export default class Queue {
    // Array is used to implement a Queue
    constructor() {
        this.items = [];
        this.max = undefined;
    }

    getAverage(){
        if(this.isEmpty())
            return 0;

        const sum = this.items.reduce((i1, i2) => i1 + i2 );
        return  sum / this.items.length;
    }

    setMaxItems(max){
        this.max = max;
    }

    // enqueue function
    enqueue(element) {
        while(this.max && this.items.length >= this.max){
            this.dequeue();
        }

        // adding element to the queue
        this.items.push(element);
    }

    // dequeue function
    dequeue() {
        // removing element from the queue
        // returns underflow when called
        // on empty queue
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }

    // peek function
    peek() {
        // returns the Front element of
        // the queue without removing it.
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
    }

    // isEmpty function
    isEmpty() {
        // return true if the queue is empty.
        return this.items.length == 0;
    }

    // printQueue function
    printQueue() {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i] + " ";
        return str;
    }

    get queueItems() {
        return this.items;
    } 
}
